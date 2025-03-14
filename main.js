console.log("Processo Principal")
 
// importação dos recursos do frame work
const { app, BrowserWindow, nativeTheme, Menu, shell } = require('electron/main')
 
// janela principal
let win
const createWindow = () => {
    // definindo o tema da janela claro ou escuro
    nativeTheme.themeSource = 'light'
    win = new BrowserWindow({
        width: 1010,
        height: 720,
        //frame: false,
        //resizable: false,
        //minimizable: false,
        //closable: false,
        //autoHideMenuBar: true
    })
 
    // Carregar o menu personalização
    // Antes importar o recurso menu
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
 
    // carregar o documento html
    win.loadFile('./src/views/index.html')
}
 
// Janela Sobre
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    // Obter a janela principal
    const mainwindow = BrowserWindow.getFocusedWindow()
    // Validação (se existir a janela principal)
    if (mainwindow) {
        about = new BrowserWindow({
            width: 320,
            height: 280,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            // estabelecer uma relçao hierarquica entre janelas
            parent: mainwindow,
            // criar uma janela modal (so retorna a principal quando encerrado)
            modal: true
        })
    }
    about.loadFile('./src/views/sobre.html')
}
 
// inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
    createWindow()
 
    // so ativar a janela principal se nenhuma outra estiver ativa
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})
 
 
// se o sistema não for mac encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
 
// Reduzir o verbozidade de tops não criticos (devtools)
app.commandLine.appendSwitch('log-level', '3')
 
// template do menu
const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Sair',
                accelerator: 'Alt+F4',
                click: () => app.quit()
            },
            {
                type: 'separator'
            },
        ]
    },
    {
        label: 'Relatório',
        submenu:[
            {
                label: 'Clientes'
            }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn',
            },
            {
                label: 'Reduzir',
                role: 'zoomOut',
            },
            {
                label: 'Restaurar Zoom padrão',
                role: 'resetZoom',
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'DevTools',
                role: 'toggleDevTools',
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Repositorio',
                click: () => shell.openExternal('https://github.com/guiH0l1/cadastroCliente_electron')
            },
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]