module.exports = {
  newFile,
  newFileStream
}

function newFile (type, destination, value) {
  return {
    type,
    destination,
    value
  }
}

function newFileStream (d, v) {
  return newFile('stream', d, v)
}
