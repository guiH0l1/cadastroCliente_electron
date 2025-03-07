console.log("Electron - Processo principal")

// importação dos recursos do framework
// app (aplicação)
// BrowserWindow (criação da janela)
// nativeTheme (definir tema claro ou escuro)
// Menu (definir um menu personalizado)
// shell (acessar links externos no navegador padrão)
const { app, BrowserWindow, nativeTheme, Menu, shell} = require('electron/main')


//Janela principal
let win
const createWindow = () => {
  // definindo o tema claro ou escuroda janela claro ou escuro
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1010,
    height: 720,
    //frame: false,
    //resizable: false, 
    //minimizable: false,
    //closable: false,
    //autoHideMenuBar: true,
    //movable: false
  })

  // carregar o menu personalizado
  // Atenção! antes importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  // Carregar o documento html na janela
  win.loadFile('./src/views/index.html')
}

// Janela sobre
let about
function aboutWindow() {
  nativeTheme.themeSource='light'
  // obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 320,
      height: 280,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      //estabelecer uma relação hierarquica entre janelas
      parent: mainWindow,
      // criar uma janela modal (só retorna a principal quando encerrada)
      modal: true
    })
  }
  about.loadFile('./src/views/sobre.html')
}

// inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow()


  // só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// se o sistema não MAC encerrar a aplicação quando a janela for fechada 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//Reduzir o verbozidade de tops não criticos (devtools)
app.commandLine.appendSwitch('log-level','3')

//template do meni
const template = [
  {
    label: 'Notas',
    submenu: [ 
      {
        label: 'Criar nota',
        accelerator: 'Ctrl+N',
      },
      {
          type: 'separator'
      },
      {
        label: 'Sair',
        accelerator: 'Alt+F4',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir zoom',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar Zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools'
      }
    ]
  },
  { 
    label: 'Ajuda',
    submenu:[
      {
        label: 'Repositorio',
        click: () => shell.openExternal('https://github.com/guiH0l1')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]