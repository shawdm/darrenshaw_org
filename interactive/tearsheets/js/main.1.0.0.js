import { loadIndex, getImagesByTagId, getImagesByLindbergh, getImagesBySkin, getImagesByBwLight, getImagesByBlue, getImagesByPink, getImagesByPalette, getTopModelTags, getMetadataImageCount, getMetadataPublishDate } from './modules/tearsheets-index.js';
import { optimalThumbnailCount, displayImages, displayTopModels, displayNextTopModels, displayMetadata } from './modules/tearsheets-ui.js';


const THUMBNAIL_WIDTH = 102; // 100 (width) + 2 (grid spacing)
const TOP_MODEL_COUNT = 101;

const THUMBNAIL_SKIN_COUNT_TARGET = 90;
const contentSkinElement = document.getElementById("content-skin");
const contentSkinWidth = contentSkinElement.offsetWidth - 4;
const thumbnailSkinCount = optimalThumbnailCount(THUMBNAIL_SKIN_COUNT_TARGET, contentSkinWidth, THUMBNAIL_WIDTH);

const THUMBNAIL_LINDBERGH_COUNT_TARGET = 90;
const contentLindberghElement = document.getElementById("content-lindbergh");
const contentLindberghWidth = contentLindberghElement.offsetWidth - 4;
const thumbnailLindberghCount = optimalThumbnailCount(THUMBNAIL_LINDBERGH_COUNT_TARGET, contentLindberghWidth, THUMBNAIL_WIDTH);


const THUMBNAIL_BW_LIGHT_COUNT_TARGET = 90;
const contentBwLightElement = document.getElementById("content-bw-light");
const contentBwLightWidth = contentBwLightElement.offsetWidth - 4;
const thumbnailBwCount = optimalThumbnailCount(THUMBNAIL_BW_LIGHT_COUNT_TARGET, contentBwLightWidth, THUMBNAIL_WIDTH);

const THUMBNAIL_BLUE_COUNT_TARGET = 45;
const contentBlueElement = document.getElementById("content-blue");
const contentBlueWidth = contentBlueElement.offsetWidth - 4;
const thumbnailBlueCount = optimalThumbnailCount(THUMBNAIL_BLUE_COUNT_TARGET, contentBlueWidth, THUMBNAIL_WIDTH);

const THUMBNAIL_PINK_COUNT_TARGET = 45;
const contentPinkElement = document.getElementById("content-pink");
const contentPinkWidth = contentPinkElement.offsetWidth - 4;
const thumbnailPinkCount = optimalThumbnailCount(THUMBNAIL_PINK_COUNT_TARGET, contentPinkWidth, THUMBNAIL_WIDTH);

const THUMBNAIL_TOP_MODEL_COUNT = 90;
const contentTopModelElement = document.getElementById("content-top-model");
const contentTopModelWidth = contentTopModelElement.offsetWidth - 4;
const thumbnailTopModelCount = optimalThumbnailCount(THUMBNAIL_TOP_MODEL_COUNT, contentTopModelWidth, THUMBNAIL_WIDTH);


await loadIndex();

displayMetadata(getMetadataPublishDate(), getMetadataImageCount());

displayImages(getImagesBySkin(thumbnailSkinCount), displayByTag, contentSkinElement);
displayImages(getImagesByLindbergh(thumbnailLindberghCount), displayByTag, contentLindberghElement);
displayImages(getImagesByBwLight(thumbnailBwCount), displayByTag, contentBwLightElement);
displayImages(getImagesByBlue(thumbnailBlueCount), displayByTag, contentBlueElement);
displayImages(getImagesByPink(thumbnailPinkCount), displayByTag, contentPinkElement);


const topModelTags = getTopModelTags();
displayTopModels(topModelTags[0]);
displayNextTopModels(topModelTags.slice(1,TOP_MODEL_COUNT), displayByModelTagId);
displayImages(getImagesByTagId(topModelTags[0].id, thumbnailTopModelCount), displayByTag, contentTopModelElement);


function displayByTag(tagId){
    if(tagId){
        displayImages(getImagesByTagId(tagId), callSimilarById)
    }    
}

function displayByModelTagId(modelTagId){
    const modelTag = topModelTags.find(modelTag => modelTag.id = modelTagId);
    displayImages(getImagesByTagId(modelTag.id, thumbnailTopModelCount), displayByTag, contentTopModelElement);
    contentTopModelElement.scrollIntoView({block: "nearest", inline: "nearest", behavior: "smooth"});
}

function callSimilarById(sourceImageId){
    displayImages(getImagesByPalette(sourceImageId), callSimilarById);
}