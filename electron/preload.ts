import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type GeurusApi } from '../shared/ipc'

// 렌더러에는 계약된 함수만 노출한다. ipcRenderer 자체는 넘기지 않는다.
const api: GeurusApi = {
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.send(IPC.overlaySetIgnoreMouse, ignore),
}

contextBridge.exposeInMainWorld('geurus', api)
