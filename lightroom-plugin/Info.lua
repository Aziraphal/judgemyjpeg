--[[----------------------------------------------------------------------------

Info.lua
JudgeMyJPEG Plugin pour Adobe Lightroom Classic

Plugin d'analyse IA de photos intégré à Lightroom
Connecte directement vos photos à l'API JudgeMyJPEG

------------------------------------------------------------------------------]]

return {
    LrSdkVersion = 3.0,
    LrSdkMinimumVersion = 3.0,

    LrToolkitIdentifier = 'com.judgemyjpeg.lightroom',
    LrPluginName = 'JudgeMyJPEG - Analyse IA',
    
    LrPluginInfoUrl = 'https://www.judgemyjpeg.fr',
    LrPluginInfoProvider = 'JudgeMyJPEG.lua',
    
    LrHelpMenuItems = {
        {
            title = 'Guide du plugin JudgeMyJPEG',
            file = 'guide.html'
        }
    },
    
    LrLibraryMenuItems = {
        {
            title = 'Analyser avec JudgeMyJPEG',
            file = 'AnalyzePhoto.lua',
        },
        {
            title = 'Analyse par lot JudgeMyJPEG',
            file = 'BatchAnalyze.lua',
        },
        {
            title = 'Paramètres JudgeMyJPEG',
            file = 'Settings.lua',
        }
    },
    
    LrExportMenuItems = {
        {
            title = 'Exporter et analyser avec JudgeMyJPEG',
            file = 'ExportAndAnalyze.lua',
        }
    },
    
    LrMetadataProvider = 'JudgeMyJPEGMetadata.lua',
    
    VERSION = { major=1, minor=0, revision=0, build=1 },
}