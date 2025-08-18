--[[----------------------------------------------------------------------------

JudgeMyJPEG.lua
Point d'entrée principal et informations du plugin

------------------------------------------------------------------------------]]

local LrDialogs = import 'LrDialogs'
local LrView = import 'LrView'
local LrBinding = import 'LrBinding'
local LrHttp = import 'LrHttp'
local LrFunctionContext = import 'LrFunctionContext'
local LrColor = import 'LrColor'

-- Informations du plugin
local function showPluginInfo()
    LrFunctionContext.callWithContext('pluginInfo', function(context)
        local f = LrView.osFactory()
        local properties = LrBinding.makePropertyTable(context)
    
    local contents = f:column {
        bind_to_object = properties,
        spacing = f:control_spacing(),
        
        f:static_text {
            title = 'JudgeMyJPEG Plugin pour Lightroom',
            font = '<system/bold>',
            text_color = LrColor('blue')
        },
        
        f:static_text {
            title = 'Version 1.0.0',
            font = '<system>'
        },
        
        f:separator {},
        
        f:static_text {
            title = 'Analysez vos photos directement depuis Lightroom avec l\'IA JudgeMyJPEG',
            width = 400
        },
        
        f:spacer { height = 10 },
        
        f:static_text {
            title = 'Fonctionnalités:',
            font = '<system/bold>'
        },
        
        f:static_text {
            title = '• Analyse individuelle de photos avec note sur 100',
            width = 400
        },
        
        f:static_text {
            title = '• Analyse par lot pour traiter plusieurs photos en une fois',
            width = 400
        },
        
        f:static_text {
            title = '• 3 modes d\'analyse: Professionnel, Cassant, Expert',
            width = 400
        },
        
        f:static_text {
            title = '• Support multilingue (6 langues)',
            width = 400
        },
        
        f:static_text {
            title = '• Sauvegarde automatique des scores dans les métadonnées',
            width = 400
        },
        
        f:static_text {
            title = '• Interface intégrée à Lightroom',
            width = 400
        },
        
        f:separator {},
        
        f:static_text {
            title = 'Pour commencer:',
            font = '<system/bold>'
        },
        
        f:static_text {
            title = '1. Obtenez votre clé API gratuite sur judgemyjpeg.fr',
            width = 400
        },
        
        f:static_text {
            title = '2. Configurez le plugin: Menu Lightroom > Paramètres JudgeMyJPEG',
            width = 400
        },
        
        f:static_text {
            title = '3. Sélectionnez une photo et lancez l\'analyse',
            width = 400
        },
        
        f:separator {},
        
        f:row {
            f:push_button {
                title = 'Ouvrir le site web',
                action = function()
                    LrHttp.openUrlInBrowser('https://www.judgemyjpeg.fr')
                end
            },
            
            f:push_button {
                title = 'Paramètres',
                action = function()
                    require 'Settings'
                end
            }
        }
    }
    
        LrDialogs.presentModalDialog {
            title = 'À propos de JudgeMyJPEG',
            contents = contents,
            cancelVerb = '< exclude "Cancel" >',
            actionVerb = 'Fermer'
        }
    end)
end

-- Point d'entrée pour les infos
showPluginInfo()