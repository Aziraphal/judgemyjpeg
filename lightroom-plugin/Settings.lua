--[[----------------------------------------------------------------------------

Settings.lua
Interface de configuration du plugin JudgeMyJPEG

------------------------------------------------------------------------------]]

local LrView = import 'LrView'
local LrBinding = import 'LrBinding'
local LrDialogs = import 'LrDialogs'
local LrPrefs = import 'LrPrefs'
local LrLogger = import 'LrLogger'
local LrHttp = import 'LrHttp'
local LrTasks = import 'LrTasks'

local logger = LrLogger('JudgeMyJPEG-Settings')

-- Interface de configuration
local function showSettingsDialog()
    local f = LrView.osFactory()
    local properties = LrBinding.makePropertyTable()
    local prefs = LrPrefs.prefsForPlugin()
    
    -- Initialiser les propriétés avec les préférences existantes
    properties.apiKey = prefs.apiKey or ''
    properties.defaultTone = prefs.defaultTone or 'professional'
    properties.defaultLanguage = prefs.defaultLanguage or 'fr'
    properties.autoSaveMetadata = prefs.autoSaveMetadata ~= false -- true par défaut
    properties.exportQuality = prefs.exportQuality or 90
    properties.maxImageSize = prefs.maxImageSize or 2048
    
    -- État de validation
    properties.apiKeyValid = false
    properties.validationMessage = ''
    
    -- Fonction de validation API Key
    local function validateApiKey()
        if not properties.apiKey or properties.apiKey == '' then
            properties.validationMessage = 'Clé API requise'
            properties.apiKeyValid = false
            return
        end
        
        properties.validationMessage = 'Validation en cours...'
        
        LrTasks.startAsyncTask(function()
            local response, headers = LrHttp.get('https://judgemyjpeg.fr/api/status', {
                { field = 'Authorization', value = 'Bearer ' .. properties.apiKey },
                { field = 'User-Agent', value = 'JudgeMyJPEG-Lightroom-Plugin/1.0' }
            })
            
            if response and string.find(response, '"status":"ok"') then
                properties.validationMessage = '✓ Clé API valide'
                properties.apiKeyValid = true
            else
                properties.validationMessage = '✗ Clé API invalide'
                properties.apiKeyValid = false
            end
        end)
    end
    
    local contents = f:column {
        bind_to_object = properties,
        spacing = f:control_spacing(),
        
        f:static_text {
            title = 'Configuration JudgeMyJPEG',
            font = '<system/bold>',
            text_color = LrColor('blue')
        },
        
        f:separator {},
        
        -- Section API
        f:group_box {
            title = 'Authentification API',
            
            f:column {
                spacing = f:label_spacing(),
                
                f:row {
                    f:static_text {
                        title = 'Clé API:',
                        width = LrView.share('label_width')
                    },
                    f:password_field {
                        value = LrView.bind('apiKey'),
                        width = 300,
                        immediate = true
                    }
                },
                
                f:row {
                    f:push_button {
                        title = 'Valider la clé',
                        action = validateApiKey,
                        enabled = LrView.bind {
                            key = 'apiKey',
                            transform = function(value)
                                return value and value ~= ''
                            end
                        }
                    },
                    f:static_text {
                        title = LrView.bind('validationMessage'),
                        text_color = LrView.bind {
                            key = 'apiKeyValid',
                            transform = function(valid)
                                return valid and LrColor('green') or LrColor('red')
                            end
                        }
                    }
                },
                
                f:static_text {
                    title = 'Obtenez votre clé API gratuite sur judgemyjpeg.fr',
                    text_color = LrColor('gray'),
                    font = '<system/small>'
                }
            }
        },
        
        f:separator {},
        
        -- Section Paramètres par défaut
        f:group_box {
            title = 'Paramètres par défaut',
            
            f:column {
                spacing = f:label_spacing(),
                
                f:row {
                    f:static_text {
                        title = 'Mode d\'analyse:',
                        width = LrView.share('label_width')
                    },
                    f:popup_menu {
                        value = LrView.bind('defaultTone'),
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
                        value = LrView.bind('defaultLanguage'),
                        items = {
                            { title = 'Français', value = 'fr' },
                            { title = 'English', value = 'en' },
                            { title = 'Español', value = 'es' },
                            { title = 'Deutsch', value = 'de' },
                            { title = 'Italiano', value = 'it' },
                            { title = 'Português', value = 'pt' }
                        }
                    }
                }
            }
        },
        
        f:separator {},
        
        -- Section Export
        f:group_box {
            title = 'Paramètres d\'export',
            
            f:column {
                spacing = f:label_spacing(),
                
                f:row {
                    f:static_text {
                        title = 'Qualité JPEG:',
                        width = LrView.share('label_width')
                    },
                    f:slider {
                        value = LrView.bind('exportQuality'),
                        min = 50,
                        max = 100,
                        width = 200
                    },
                    f:static_text {
                        title = LrView.bind {
                            key = 'exportQuality',
                            transform = function(value)
                                return string.format('%d%%', value)
                            end
                        }
                    }
                },
                
                f:row {
                    f:static_text {
                        title = 'Taille max (px):',
                        width = LrView.share('label_width')
                    },
                    f:popup_menu {
                        value = LrView.bind('maxImageSize'),
                        items = {
                            { title = '1024px', value = 1024 },
                            { title = '2048px', value = 2048 },
                            { title = '3072px', value = 3072 },
                            { title = '4096px', value = 4096 },
                            { title = 'Originale', value = 0 }
                        }
                    }
                },
                
                f:checkbox {
                    title = 'Sauvegarder automatiquement les métadonnées',
                    value = LrView.bind('autoSaveMetadata')
                }
            }
        }
    }
    
    local result = LrDialogs.presentModalDialog {
        title = 'Paramètres JudgeMyJPEG',
        contents = contents,
        actionVerb = 'Sauvegarder',
        cancelVerb = 'Annuler'
    }
    
    if result == 'ok' then
        -- Sauvegarder les préférences
        prefs.apiKey = properties.apiKey
        prefs.defaultTone = properties.defaultTone
        prefs.defaultLanguage = properties.defaultLanguage
        prefs.autoSaveMetadata = properties.autoSaveMetadata
        prefs.exportQuality = properties.exportQuality
        prefs.maxImageSize = properties.maxImageSize
        
        LrDialogs.message('Paramètres sauvegardés', 
            'La configuration JudgeMyJPEG a été mise à jour avec succès.')
    end
end

-- Point d'entrée
showSettingsDialog()