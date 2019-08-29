module.exports = {
  newFileStream
}

function newFileStream (source, destination, stream) {
  return {
    source,
    destination,
    stream
  }
}
