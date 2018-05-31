const gcs = require('@google-cloud/storage')();
const Vision = require('@google-cloud/vision');
const vision = new Vision();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

// Import the Cloud Functions for Firebase and the Firebase Admin modules here.
const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

// Write the addWelcomeMessages Function here.
exports.welcomeMessage = functions.auth.user().onCreate(user => {
    const fullName = user.displayName || 'Safadinho';

    // Saves the new welcome message into the database
    // Then displays it in the Firebase Chat client
    return admin.database().ref('messages').push({
        name: 'Firebot',
        photoUrl: '/images/firebase-logo.png',
        text: `${fullName} signed in for the first time. Welcome!`,
    }).then(() => {
        console.log(`welcome message to database`);
    });
});

// Write the blurOffensiveImages Function here.
exports.blurOffensiveImages = functions.storage.object().onFinalize(object => {
    const image = {
      source: {imageUri: `gs://${object.bucket}/${object.name}`},
    };
  
    // Check the image content using the Cloud Vision API.
    return vision.safeSearchDetection(image).then(batchAnnotateImagesResponse => {
      const safeSearchResult = batchAnnotateImagesResponse[0].safeSearchAnnotation;
      const Likelihood = Vision.types.Likelihood;
      if (Likelihood[safeSearchResult.adult] >= Likelihood.LIKELY ||
          Likelihood[safeSearchResult.violence] >= Likelihood.LIKELY) {
        console.log('The image', object.name, 'has been detected as inappropriate.');
        return blurImage(object.name, object.bucket);
      } else {
        console.log('The image', object.name,'has been detected as OK.');
        return null;
      }
    });
    // Blurs the given image located in the given bucket using ImageMagick.
function blurImage(filePath, bucketName, metadata) {
    const tempLocalFile = path.join(os.tmpdir(), path.basename(filePath));
    const messageId = filePath.split(path.sep)[1];
    const bucket = gcs.bucket(bucketName);
  
    // Download file from bucket.
    return bucket.file(filePath).download({destination: tempLocalFile}).then(() => {
      console.log('Image has been downloaded to', tempLocalFile);
      // Blur the image using ImageMagick.
      return spawn('convert', [tempLocalFile, '-channel', 'RGBA', '-blur', '0x24', tempLocalFile]);
    }).then(() => {
      console.log('Image has been blurred');
      // Uploading the Blurred image back into the bucket.
      return bucket.upload(tempLocalFile, {destination: filePath});
    }).then(() => {
      console.log('Blurred image has been uploaded to', filePath);
      // Deleting the local file to free up disk space.
      fs.unlinkSync(tempLocalFile);
      console.log('Deleted local file.');
      // Indicate that the message has been moderated.
      return admin.database().ref(`/messages/${messageId}`).update({moderated: true});
    }).then(() => {
      console.log('Marked the image as moderated in the database.');
      return null;
    });
  }
});



// TODO(DEVELOPER): Write the sendNotifications Function here.
