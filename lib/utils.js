module.exports = {
  newFileStream
}

function newFileStream (destination, stream) {
  return {
    destination,
    stream
  }
}
