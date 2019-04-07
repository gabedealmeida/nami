const AWS = require('aws-sdk');
const { asyncDescribeImages } = require('./../aws/awsFunctions.js');

const sortImagesByDate = function (array) {
  return array.sort(function (imageA, imageB) {
    const dateA = new Date(imageA.CreationDate);
    const dateB = new Date(imageB.CreationDate);

    return dateB - dateA;
  });
};

module.exports = async function getMostRecentUbuntuImageId() {
  const describeImagesParams = { 
    Filters: [
      { Name: 'name', 
        Values: ['ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-*']
      },
      { Name: 'is-public',
        Values: ['true'],
      },
      { Name: 'root-device-type',
        Values: ['ebs'],
      },
      { Name: 'state',
        Values: ['available'],
      },
    ],
  };

  const results = await asyncDescribeImages(describeImagesParams);
  const images = results.Images;

  return sortImagesByDate(images)[0].ImageId;
}