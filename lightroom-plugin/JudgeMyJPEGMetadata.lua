--[[----------------------------------------------------------------------------

JudgeMyJPEGMetadata.lua
Définition des métadonnées personnalisées pour JudgeMyJPEG

------------------------------------------------------------------------------]]

return {
    metadataFieldsForPhotos = {
        {
            id = 'judgeScore',
            title = 'Score JudgeMyJPEG',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeAnalysisDate',
            title = 'Date analyse JudgeMyJPEG',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeTone',
            title = 'Mode analyse JudgeMyJPEG',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeComposition',
            title = 'Score Composition',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeLighting',
            title = 'Score Éclairage',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeFocus',
            title = 'Score Netteté',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeExposure',
            title = 'Score Exposition',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeCreativity',
            title = 'Score Créativité',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeEmotion',
            title = 'Score Émotion',
            dataType = 'string',
            searchable = true,
            browsable = true,
        },
        {
            id = 'judgeStorytelling',
            title = 'Score Narration',
            dataType = 'string',
            searchable = true,
            browsable = true,
        }
    },
    
    schemaVersion = 1,
}