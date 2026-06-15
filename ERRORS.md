[Influencer] Erro email confirmação: [TypeError: fetch failed] {
  [cause]: Error: write ETIMEDOUT
      at WriteWrap.onWriteComplete [as oncomplete] (node:internal/stream_base_commons:87:19)
      at writevGeneric (node:internal/stream_base_commons:137:26)
      at Socket._writeGeneric (node:net:964:11)
      at Socket._writev (node:net:973:8)
      at doWrite (node:internal/streams/writable:594:12)
      at clearBuffer (node:internal/streams/writable:773:5)
      at Writable.uncork (node:internal/streams/writable:529:7)
      at AsyncWriter.write (node:internal/deps/undici/undici:8126:16)
      at writeIterable (node:internal/deps/undici/undici:8045:23) {
    errno: -110,
    code: 'ETIMEDOUT',
    syscall: 'write'
  }
}