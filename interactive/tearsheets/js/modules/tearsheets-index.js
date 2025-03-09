var index = null;
const PALETTE_EMBEDDING_BW_LINDBERGH = [
    -64.465385,
    35.412514,
    56.059467,
    -30.82463,
    10.102867,
    -41.71093,
    20.441185,
    12.224448,
    2.5196416,
    4.22225,
    -1.3909373,
    -13.483529,
    -35.032253,
    -22.295866,
    8.206792
];

const PALETTE_EMBEDDING_SKIN = [
    -78.6074,
    35.65149,
    65.775566,
    -50.59515,
    -8.975287,
    -44.473072,
    21.001581,
    13.474271,
    6.8732543,
    1.9276023,
    38.406433,
    -13.13301,
    -45.67634,
    -22.906855,
    11.271304
];

const PALETTE_EMBEDDING_BW_LIGHT = [
    -78.676704, 
    41.79716, 
    70.103355, 
    -37.020298, 
    13.163081, 
    -53.208443, 
    22.078844, 
    17.703993, 
    7.55821, 
    1.3764896, 
    -2.520678, 
    -16.707859, 
    -40.77858, 
    -27.077341, 
    9.210164
];

const PALETTE_EMBEDDING_BLUE = [
    -69.23907,
    54.551094,
    66.53689,
    -25.932049,
    24.512505,
    -35.35193,
    38.16333,
    17.587484,
    -3.6460059,
    -1.3831577,
    -23.779964,
    -38.945892,
    -20.288845,
    -8.542256,
    2.334223
];

const PALETTE_EMBEDDING_PINK = [
    -119.77364,
    27.111624,
    72.29065,
    -14.263409,
    7.5149546,
    -35.923306,
    0.5627966,
    2.1672034,
    -0.9169544,
    2.226598,
    28.979187,
    -27.467535,
    -9.4299965,
    -3.791288,
    4.368486
]

function loadIndex() {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    const url = `${DATA_PATH}/index.json`;
    return fetch(url, requestOptions)
        .then(parseIndexResponse)
        .then(loadedIndex => {
            index = loadedIndex;
            index.images = index.images
                .map((image) => imageWithModelName(image))
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

function parseIndexResponse(response) {
    if (response.status != 200) {
        console.log('Error', response)
    }
    return response.json();
}

function getMetadataImageCount(){
    return index.images.length;
}

function getMetadataPublishDate(){
    return index.indexMetadata.publish_date;
}

function getMetadataModels() {
    return index.indexMetadata.model_tags;
}

function getImagesByTagId(tag, count = index.images.length) {
    return index.images
        .filter((image) => image.tags.includes(tag))
        .slice(0, count);
}

function getImagesByLindbergh(count = index.images.length) {
    return getImagesByEmbedding(PALETTE_EMBEDDING_BW_LINDBERGH)
        .slice(0, count);
}

function getImagesBySkin(count = index.images.length) {
    return getImagesByEmbedding(PALETTE_EMBEDDING_SKIN)
        .slice(0, count);
}

function getImagesByBwLight(count = index.images.length) {
    return getImagesByEmbedding(PALETTE_EMBEDDING_BW_LIGHT)
        .slice(0, count);
}

function getImagesByBlue(count = index.images.length) {
    return getImagesByEmbedding(PALETTE_EMBEDDING_BLUE)
        .slice(0, count);
}

function getImagesByPink(count = index.images.length) {
    return getImagesByEmbedding(PALETTE_EMBEDDING_PINK)
        .slice(0, count);
}

function getImagesByPalette(imageId, count = index.images.length) {
    const searchPalette = index.images
        .find((image) => image.id === imageId)
        .colour_palette_embedding;

    return getImagesByEmbedding(searchPalette)
        .slice(0, count);
}

function getImagesByEmbedding(searchEmbedding) {
    return index.images.
        sort((a, b) => cosineSimilarity(searchEmbedding, b.colour_palette_embedding) - cosineSimilarity(searchEmbedding, a.colour_palette_embedding));
}

function dotProduct(x, y) {
    function dotp_sum(a, b) {
        return a + b;
    }
    function dotp_times(a, i) {
        return x[i] * y[i];
    }
    return x.map(dotp_times).reduce(dotp_sum, 0);
}

function cosineSimilarity(A, B) {
    var similarity = dotProduct(A, B) / (Math.sqrt(dotProduct(A, A)) * Math.sqrt(dotProduct(B, B)));
    return similarity;
}

function imageWithModelName(image) {
    const modelMetadata = getMetadataModels()
        .find((modelMetadata) => image.tags.includes(modelMetadata.id))

    if (modelMetadata != null) {
        return Object.assign(image, { display_text: modelMetadata.display_text });
    }
    else {
        return image
    }
}

function getTopModelTags(){
    const modelDisplayTextIndex = new Map(index.indexMetadata.model_tags.map((obj) => [obj.id, obj.display_text]));

    const modelTags = index.indexMetadata.model_tags.map(tag => tag.id);
    const imageTags = index.images.flatMap(image => image.tags);
    const tagsCountsMap = groupByCount(imageTags, tag => tag);
    const tagsCountsArray = Array.from(tagsCountsMap, ([key, value]) => ({ id: key, count: value }));
    
    const modelTagCounts = tagsCountsArray
        .filter(tagCount => modelTags.includes(tagCount.id))
        .map(modelTagCount => ({id: modelTagCount.id, count: modelTagCount.count, display_text: modelDisplayTextIndex.get(modelTagCount.id)  }))
        .sort((a, b) => b.count-a.count)
    return modelTagCounts;
}


function groupByCount(list, groupByFunction) {
    const map = new Map();
    list.forEach((item) => {
         const key = groupByFunction(item);
         const countItem = map.get(key);
         if (!countItem) {
             map.set(key, 1);
         } else {
            map.set(key, countItem + 1);
         }
    });
    return map;
}



export { loadIndex, getImagesByTagId, getImagesByLindbergh, getImagesBySkin, getImagesByBwLight, getImagesByBlue, getImagesByPink, getImagesByPalette, getTopModelTags, getMetadataImageCount, getMetadataPublishDate };