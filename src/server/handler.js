const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
    
    const { image } = request.payload;

    const imageSize = Buffer.byteLength(image, 'base64'); 
    const MAX_SIZE = 1000000; 

    if (imageSize > MAX_SIZE) {
        const response = h.response({
            status: 'fail',
            message: `Payload content length greater than maximum allowed: 1000000`
        });
        return response.code(413);
    }
    
    const { model } = request.server.app;

    const { label, suggestion } = await predictClassification(model, image);

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
        id: id,
        result: label,
        suggestion: suggestion,
        createdAt: createdAt
    };

    await storeData(id, data);

    const response = h.response({
        status: 'success',
        message: "Model is predicted successfully",
        data: data
    });
    response.code(201); 
    return response;
}

module.exports = postPredictHandler;
