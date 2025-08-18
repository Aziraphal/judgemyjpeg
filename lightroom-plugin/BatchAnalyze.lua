--[[----------------------------------------------------------------------------

BatchAnalyze.lua
Analyse par lot de photos sélectionnées avec JudgeMyJPEG

------------------------------------------------------------------------------]]

local LrApplication = import 'LrApplication'
local LrDialogs = import 'LrDialogs'
local LrHttp = import 'LrHttp'
local LrLogger = import 'LrLogger'
local LrProgressScope = import 'LrProgressScope'
local LrTasks = import 'LrTasks'
local LrView = import 'LrView'
local LrBinding = import 'LrBinding'
local LrFileUtils = import 'LrFileUtils'
local LrBase64 = import 'LrBase64'
local LrFunctionContext = import 'LrFunctionContext'

local JUDGEMYJPEG_API_URL = 'https://judgemyjpeg.fr/api/batch-analyze'
local logger = LrLogger('JudgeMyJPEG-Batch')

-- Interface de configuration du lot
local function showBatchConfigDialog(photoCount)
    return LrFunctionContext.callWithContext('batchConfig', function(context)
        local f = LrView.osFactory()
        local properties = LrBinding.makePropertyTable(context)
        local prefs = LrPrefs.prefsForPlugin()
    
    -- Initialiser avec les préférences
    properties.tone = prefs.defaultTone or 'professional'
    properties.language = prefs.defaultLanguage or 'fr'
    properties.maxConcurrent = 3 -- Limite pour éviter de surcharger l'API
    properties.delayBetweenRequests = 1000 -- ms
    
    local contents = f:column {
        bind_to_object = properties,
        spacing = f:control_spacing(),
        
        f:static_text {
            title = string.format('Analyse par lot - %d photos sélectionnées', photoCount),
            font = '<system/bold>',
            text_color = LrColor('blue')
        },
        
        f:separator {},
        
        f:row {
            f:static_text {
                title = 'Mode d\'analyse:',
                width = LrView.share('label_width')
            },
            f:popup_menu {
                value = LrView.bind('tone'),
                items = {
                    { title = 'Mode Professionnel', value = 'professional' },
                    { title = 'Mode Cassant', value = 'roast' },
                    { title = 'Mode Expert', value = 'expert' }
                }
            }
        },
        
        f:row {
            f:static_text {
                title = 'Langue:',
                width = LrView.share('label_width')
            },
            f:popup_menu {
                value = LrView.bind('language'),
                items = {
                    { title = 'Français', value = 'fr' },
                    { title = 'English', value = 'en' },
                    { title = 'Español', value = 'es' },
                    { title = 'Deutsch', value = 'de' },
                    { title = 'Italiano', value = 'it' },
                    { title = 'Português', value = 'pt' }
                }
            }
        },
        
        f:separator {},
        
        f:row {
            f:static_text {
                title = 'Analyses simultanées:',
                width = LrView.share('label_width')
            },
            f:slider {
                value = LrView.bind('maxConcurrent'),
                min = 1,
                max = 5,
                integral = true,
                width = 150
            },
            f:static_text {
                title = LrView.bind {
                    key = 'maxConcurrent',
                    transform = function(value)
                        return tostring(value)
                    end
                }
            }
        },
        
        f:row {
            f:static_text {
                title = 'Délai entre requêtes:',
                width = LrView.share('label_width')
            },
            f:slider {
                value = LrView.bind('delayBetweenRequests'),
                min = 500,
                max = 3000,
                integral = true,
                width = 150
            },
            f:static_text {
                title = LrView.bind {
                    key = 'delayBetweenRequests',
                    transform = function(value)
                        return string.format('%dms', value)
                    end
                }
            }
        },
        
        f:separator {},
        
        f:static_text {
            title = 'ℹ️ L\'analyse par lot peut prendre plusieurs minutes selon le nombre de photos.',
            text_color = LrColor('gray'),
            font = '<system/small>'
        }
    }
    
    local result = LrDialogs.presentModalDialog {
        title = 'Configuration analyse par lot',
        contents = contents,
        actionVerb = 'Démarrer',
        cancelVerb = 'Annuler'
    }
    
        if result == 'ok' then
            return {
                tone = properties.tone,
                language = properties.language,
                maxConcurrent = properties.maxConcurrent,
                delayBetweenRequests = properties.delayBetweenRequests
            }
        end
        
        return nil
    end)
end

-- Fonction d'analyse d'une photo individuelle
local function analyzePhoto(photo, config, progressScope, photoIndex, totalPhotos)
    local apiKey = _PLUGIN.preferences.apiKey
    if not apiKey or apiKey == '' then
        return { success = false, error = 'API Key manquante' }
    end
    
    -- Obtenir le chemin du fichier
    local photoPath = photo:getRawMetadata('path')
    if not photoPath or not LrFileUtils.exists(photoPath) then
        return { success = false, error = 'Fichier introuvable' }
    end
    
    progressScope:setCaption(string.format('Analyse %d/%d: %s', 
        photoIndex, totalPhotos, photo:getFormattedMetadata('fileName')))
    
    -- Lire et encoder le fichier
    local fileContent = LrFileUtils.readFile(photoPath)
    if not fileContent then
        return { success = false, error = 'Impossible de lire le fichier' }
    end
    
    local base64Image = LrBase64.encode(fileContent)
    
    -- Préparer la requête
    local requestData = {
        image = base64Image,
        tone = config.tone,
        language = config.language
    }
    
    -- Appel API
    local response, headers = LrHttp.post(JUDGEMYJPEG_API_URL, requestData, {
        { field = 'Authorization', value = 'Bearer ' .. apiKey },
        { field = 'Content-Type', value = 'application/json' },
        { field = 'User-Agent', value = 'JudgeMyJPEG-Lightroom-Plugin/1.0' }
    })
    
    if not response then
        return { success = false, error = 'Erreur réseau' }
    end
    
    -- Parser la réponse
    local success, result = pcall(function()
        return JSON:decode(response)
    end)
    
    if not success or not result.analysis then
        return { success = false, error = 'Réponse API invalide' }
    end
    
    return { success = true, analysis = result.analysis }
end

-- Fonction principale d'analyse par lot
local function batchAnalyzePhotos()
    LrFunctionContext.callWithContext('batchAnalyze', function(context)
        local catalog = LrApplication.activeCatalog()
        local selectedPhotos = catalog:getTargetPhotos()
        
        if #selectedPhotos == 0 then
            LrDialogs.message('Aucune photo sélectionnée', 
                'Veuillez sélectionner des photos dans le catalogue avant de lancer l\'analyse par lot.')
            return
        end
        
        if #selectedPhotos > 50 then
            local result = LrDialogs.confirm(
                'Beaucoup de photos sélectionnées',
                string.format('Vous avez sélectionné %d photos. L\'analyse peut prendre beaucoup de temps. Continuer ?', #selectedPhotos),
                'Continuer',
                'Annuler'
            )
            if result ~= 'ok' then
                return
            end
        end
        
        -- Configuration
        local config = showBatchConfigDialog(#selectedPhotos)
        if not config then
            return
        end
        
        -- Vérifier l'API key
        local apiKey = _PLUGIN.preferences.apiKey
        if not apiKey or apiKey == '' then
            LrDialogs.message('API Key manquante', 
                'Veuillez configurer votre clé API dans les paramètres.')
            return
        end
        
        local progressScope = LrProgressScope({
            title = 'Analyse par lot JudgeMyJPEG',
            caption = 'Initialisation...',
            functionContext = context
        })
        
        local results = {
            success = 0,
            errors = 0,
            total = #selectedPhotos
        }
        
        -- Analyser chaque photo
        for i, photo in ipairs(selectedPhotos) do
            if progressScope:isCanceled() then
                break
            end
            
            progressScope:setPortionComplete(i - 1, #selectedPhotos)
            
            local result = analyzePhoto(photo, config, progressScope, i, #selectedPhotos)
            
            if result.success then
                results.success = results.success + 1
                
                -- Sauvegarder les métadonnées
                catalog:withWriteAccessDo('JudgeMyJPEG Batch Analysis', function()
                    local analysis = result.analysis
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeScore', tostring(analysis.score))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeAnalysisDate', os.date('%Y-%m-%d %H:%M:%S'))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeTone', config.tone)
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeComposition', tostring(analysis.partialScores.composition))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeLighting', tostring(analysis.partialScores.lighting))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeFocus', tostring(analysis.partialScores.focus))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeExposure', tostring(analysis.partialScores.exposure))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeCreativity', tostring(analysis.partialScores.creativity))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeEmotion', tostring(analysis.partialScores.emotion))
                    photo:setPropertyForPlugin(_PLUGIN, 'judgeStorytelling', tostring(analysis.partialScores.storytelling))
                end)
            else
                results.errors = results.errors + 1
                logger:warn(string.format('Erreur analyse photo %d: %s', i, result.error))
            end
            
            -- Délai entre les requêtes
            if i < #selectedPhotos then
                LrTasks.sleep(config.delayBetweenRequests / 1000)
            end
        end
        
        progressScope:done()
        
        -- Afficher le résumé
        local message = string.format(
            'Analyse par lot terminée\n\n' ..
            'Photos analysées: %d\n' ..
            'Succès: %d\n' ..
            'Erreurs: %d',
            results.total, results.success, results.errors
        )
        
        LrDialogs.message('Analyse par lot terminée', message)
    end)
end

-- Inclusion JSON library (simplifiée)
JSON = {}
function JSON:decode(str)
    -- Parsing JSON basique - remplacer par vraie library en production
    local result = {}
    return result
end

-- Point d'entrée
batchAnalyzePhotos()