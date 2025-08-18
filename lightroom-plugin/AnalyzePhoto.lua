--[[----------------------------------------------------------------------------

AnalyzePhoto.lua
Analyse une photo sélectionnée avec l'IA JudgeMyJPEG

------------------------------------------------------------------------------]]

local LrApplication = import 'LrApplication'
local LrDialogs = import 'LrDialogs'
local LrHttp = import 'LrHttp'
local LrLogger = import 'LrLogger'
local LrProgressScope = import 'LrProgressScope'
local LrTasks = import 'LrTasks'
local LrView = import 'LrView'
local LrBinding = import 'LrBinding'
local LrStringUtils = import 'LrStringUtils'
local LrFileUtils = import 'LrFileUtils'
local LrPathUtils = import 'LrPathUtils'
local LrBase64 = import 'LrBase64'
local LrPhotos = import 'LrPhotos'

-- Configuration
local JUDGEMYJPEG_API_URL = 'https://judgemyjpeg.fr/api/photos/analyze'
local logger = LrLogger('JudgeMyJPEG')

-- Fonction principale d'analyse
local function analyzeSelectedPhoto()
    LrTasks.startAsyncTask(function()
        local catalog = LrApplication.activeCatalog()
        local selectedPhotos = catalog:getTargetPhotos()
        
        if #selectedPhotos == 0 then
            LrDialogs.message('Aucune photo sélectionnée', 
                'Veuillez sélectionner une photo dans le catalogue avant de lancer l\'analyse.')
            return
        end
        
        if #selectedPhotos > 1 then
            LrDialogs.message('Trop de photos sélectionnées', 
                'Veuillez sélectionner une seule photo pour l\'analyse individuelle.')
            return
        end
        
        local photo = selectedPhotos[1]
        local progressScope = LrProgressScope({
            title = 'Analyse JudgeMyJPEG en cours...',
            caption = 'Préparation de la photo...',
            functionContext = context
        })
        
        -- Vérifier si l'API key est configurée
        local apiKey = _PLUGIN.preferences.apiKey
        if not apiKey or apiKey == '' then
            progressScope:done()
            local result = LrDialogs.confirm(
                'API Key manquante',
                'Aucune clé API JudgeMyJPEG configurée. Voulez-vous ouvrir les paramètres ?',
                'Ouvrir paramètres',
                'Annuler'
            )
            if result == 'ok' then
                require 'Settings'
            end
            return
        end
        
        -- Obtenir le chemin du fichier
        local photoPath = photo:getRawMetadata('path')
        if not photoPath or not LrFileUtils.exists(photoPath) then
            progressScope:done()
            LrDialogs.message('Fichier introuvable', 
                'Le fichier de cette photo est introuvable sur le disque.')
            return
        end
        
        progressScope:setCaption('Lecture du fichier...')
        
        -- Lire le fichier et le convertir en base64
        local fileContent = LrFileUtils.readFile(photoPath)
        if not fileContent then
            progressScope:done()
            LrDialogs.message('Erreur de lecture', 
                'Impossible de lire le fichier photo.')
            return
        end
        
        progressScope:setCaption('Encodage de l\'image...')
        local base64Image = LrBase64.encode(fileContent)
        
        -- Préparer les données pour l'API
        local requestData = {
            image = base64Image,
            tone = _PLUGIN.preferences.defaultTone or 'professional',
            language = _PLUGIN.preferences.defaultLanguage or 'fr'
        }
        
        progressScope:setCaption('Envoi à l\'IA JudgeMyJPEG...')
        
        -- Appel API
        local response, headers = LrHttp.post(JUDGEMYJPEG_API_URL, requestData, {
            { field = 'Authorization', value = 'Bearer ' .. apiKey },
            { field = 'Content-Type', value = 'application/json' },
            { field = 'User-Agent', value = 'JudgeMyJPEG-Lightroom-Plugin/1.0' }
        })
        
        progressScope:done()
        
        if not response then
            LrDialogs.message('Erreur réseau', 
                'Impossible de contacter le serveur JudgeMyJPEG. Vérifiez votre connexion internet.')
            return
        end
        
        -- Parser la réponse JSON
        local success, result = pcall(function()
            return JSON:decode(response)
        end)
        
        if not success or not result.analysis then
            LrDialogs.message('Erreur API', 
                'Réponse invalide du serveur JudgeMyJPEG.')
            return
        end
        
        -- Afficher les résultats
        showAnalysisResults(result.analysis, photo)
        
        -- Sauvegarder les métadonnées
        catalog:withWriteAccessDo('JudgeMyJPEG Analysis', function()
            photo:setPropertyForPlugin(_PLUGIN, 'judgeScore', tostring(result.analysis.score))
            photo:setPropertyForPlugin(_PLUGIN, 'judgeAnalysisDate', os.date('%Y-%m-%d %H:%M:%S'))
            photo:setPropertyForPlugin(_PLUGIN, 'judgeTone', requestData.tone)
            photo:setPropertyForPlugin(_PLUGIN, 'judgeComposition', tostring(result.analysis.partialScores.composition))
            photo:setPropertyForPlugin(_PLUGIN, 'judgeLighting', tostring(result.analysis.partialScores.lighting))
            photo:setPropertyForPlugin(_PLUGIN, 'judgeFocus', tostring(result.analysis.partialScores.focus))
            photo:setPropertyForPlugin(_PLUGIN, 'judgeExposure', tostring(result.analysis.partialScores.exposure))
        end)
        
    end)
end

-- Afficher les résultats dans une dialog
function showAnalysisResults(analysis, photo)
    local f = LrView.osFactory()
    local properties = LrBinding.makePropertyTable()
    
    -- Formater le score avec couleur
    local scoreColor = analysis.score >= 85 and 'green' or 
                      analysis.score >= 70 and 'orange' or 'red'
    
    local contents = f:column {
        bind_to_object = properties,
        spacing = f:control_spacing(),
        
        f:static_text {
            title = 'Résultats de l\'analyse JudgeMyJPEG',
            text_color = LrColor('blue'),
            font = '<system/bold>'
        },
        
        f:separator {},
        
        f:row {
            f:static_text {
                title = 'Score global:',
                width = LrView.share('label_width')
            },
            f:static_text {
                title = analysis.score .. '/100',
                text_color = LrColor(scoreColor),
                font = '<system/bold>'
            }
        },
        
        f:row {
            f:static_text {
                title = 'Composition:',
                width = LrView.share('label_width')
            },
            f:static_text {
                title = analysis.partialScores.composition .. '/15'
            }
        },
        
        f:row {
            f:static_text {
                title = 'Éclairage:',
                width = LrView.share('label_width')
            },
            f:static_text {
                title = analysis.partialScores.lighting .. '/15'
            }
        },
        
        f:row {
            f:static_text {
                title = 'Netteté:',
                width = LrView.share('label_width')
            },
            f:static_text {
                title = analysis.partialScores.focus .. '/15'
            }
        },
        
        f:row {
            f:static_text {
                title = 'Exposition:',
                width = LrView.share('label_width')
            },
            f:static_text {
                title = analysis.partialScores.exposure .. '/15'
            }
        },
        
        f:separator {},
        
        f:static_text {
            title = 'Suggestions d\'amélioration:',
            font = '<system/bold>'
        },
        
        f:scrolled_view {
            horizontal_scroller = false,
            width = 400,
            height = 150,
            
            f:static_text {
                title = table.concat(analysis.suggestions, '\n• '),
                text_color = LrColor('black'),
                width = 380
            }
        }
    }
    
    LrDialogs.presentModalDialog {
        title = 'Analyse JudgeMyJPEG - ' .. photo:getFormattedMetadata('fileName'),
        contents = contents,
        cancelVerb = '< exclude "Cancel" >',
        actionVerb = 'Fermer'
    }
end

-- Inclusion JSON library simple
JSON = {}
function JSON:decode(str)
    -- Implémentation JSON basique pour Lua
    -- En production, utiliser une vraie library JSON
    local result = {}
    -- Parsing très basique - à remplacer par vraie lib JSON
    return result
end

-- Point d'entrée
analyzeSelectedPhoto()