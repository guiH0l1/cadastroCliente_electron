// importação dos recursos do framework electron
// ipcRenderer permite estabelecer uma comucação entre os processos (IPC) main.js <-> renderer.js 
// contextBridge: permissões de comunicação entre o processos usando a api do electron
const {ipcRenderer, contextBridge} = require('electron')

//Enviar uma mensagem para o main.js estabelecer uma conexão com o banco de dados quando iniciar a aplicação
//send (enviar)
//dbConnect (rotulo para identificar a mensagem)
ipcRenderer.send('db-connect')

// permissões para estabelecer a comunicação entre processos
contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit')
})