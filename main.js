console.log("processo principal")

// shell (acessar links e aplicações externas)
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const clienteModel = require('./src/models/Clientes.js')

// importação da biblioteca nativa do javaScript para manipular arquivos
const fs = require('fs')

// importação do pacote jspdf (atquivos pdf) npm install jspdf
const { jspdf, default: jsPDF } = require('jspdf')

let win
const createWindow = () => {
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1080,
    height: 900,

    webPreferences: {
      preload: path.join(__dirname, './preload.js')
    }
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(templete))

  win.loadFile('./src/views/index.html')
}

let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'

  const mainWindow = BrowserWindow.getFocusedWindow()

  if (mainWindow) {
    about = new BrowserWindow({
      width: 415,
      height: 350,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, './preload.js')
      }
    })
  }

  about.loadFile('./src/views/sobre.html')

  ipcMain.on('about-exit', () => {
    if (about && !about.isDestroyed()) {
      about.close()
    }

  })
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.on('db-connect', async (event) => {
    const conectado = await conectar()
    if (conectado) {
      setTimeout(() => {
        event.reply('db-status', "conectado")
      }, 500)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await desconectar()
})

app.commandLine.appendSwitch('log-level', '3')

const templete = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Esc'
      }
    ]
  },
  {
    label: 'Relatório',
    submenu: [
      {
        label: 'Clientes',
        click: () => relatorioClientes()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Ampliar',
        role: 'zoomIn',
        accelerator: 'Ctrl+='
      },
      {
        label: 'Reduzir',
        role: 'zoomOut',
        accelerator: 'Ctrl+-'
      },
      {
        label: 'Tamanho padrão',
        role: 'resetZoom',
        accelerator: 'Ctrl+0'
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
        accelerator: 'Ctrl+Shift'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

//= CRUD CREATE ==================================================

ipcMain.on('create-cliente', async (event, newCliente) => {
  console.log(newCliente)

  try {
    const newClientes = clienteModel({
      nome: newCliente.nomeCli,
      sexo: newCliente.sexoCli,
      cpf: newCliente.cpfCli,
      email: newCliente.emailCli,
      telefone: newCliente.telCli,
      cep: newCliente.cepCli,
      logradouro: newCliente.logradouroCli,
      numero: newCliente.numeroCli,
      complemento: newCliente.complementoCli,
      bairro: newCliente.bairroCli,
      cidade: newCliente.cidadeCli,
      uf: newCliente.ufCli,
    })

    await newClientes.save()

    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso.",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })

  } catch (error) {
    // Tratamento da excessão "CPF duplicado"
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "Atenção!!!",
        message: "CPF já cadastrado.\nVerifique o número digitado",
        buttons: ['OK']
      }).then((result) => {
        // Se o botão OK for pressionado
        if (result.response === 0) {
          // Encontrar o campo de CPF
          event.reply('reset-cpf')
        }
      })
    } else {
      console.log(error);
    }
  }
})

// == Fim - Clientes - CRUD Create
// ==============================================

// ==============================================
// == relátorio de clientes =====================
async function relatorioClientes() {
  try {
    // ===============================================
    //     Configuração do documento pdf
    //================================================
    // p (portrait) l(landscape)
    // a4 (210mm x 297mm)
    const doc = new jsPDF('p', 'mm', 'a4')

    // inserir data atual o documento
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    // doc.setFontSize() tamanho da fonte
    doc.getFontSize(10)
    //  doc.text() escreve um texto no documento
    doc.text(`Data: ${dataAtual}`, 160, 15) //(x,y(mm))
    doc.getFontSize(18)
    doc.text('Relatório de clientes', 15, 20)
    doc.setFontSize(12)
    let y = 40
    //cabeçalho da tabela
    doc.text("Nome", 14, y)
    doc.text("Telefone", 85, y)
    doc.text("E-mail", 130, y)
    y += 5
    // desenhar uma linha
    doc.setLineWidth(0.5)
    doc.line(10, y, 200, y) // (10 (inicio)_________________ 200(Fim))
    y += 10

    // ===============================================
    // Obter a listagem de clientes (ordem alfabética)
    //================================================
    const clientes = await clienteModel.find().sort({ nome: 1 })
    //teste de recebimento (importante)
    //console.log(clientes)
    // popular o documento pdf com os clientes cadastrados
    clientes.forEach((c) => {
      // criar uma nova pagina se y > 280mm (A4 = 297mm)
      if (y > 280) {
        doc.addPage()
        y = 20 // margem de 2 cm para iniciar nova folha
        //cabeçalho da tabela
        doc.text("Nome", 14, y)
        doc.text("Telefone", 85, y)
        doc.text("E-mail", 130, y)
        y += 5
        // desenhar uma linha
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y) // (10 (inicio)_________________ 200(Fim))
        y += 10
      }
      doc.text(c.nome, 15, y)
      doc.text(c.telefone, 90, y)
      doc.text(c.email, 130, y)
      y += 10
    })

    // ===============================================
    // Numeração automatica de página
    //================================================

    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${pages}`, 105, 290, { align: 'center' })
    }

    // ===============================================
    // Abrir o arquivo pdf no sistema operacional
    //================================================

    // Definir o caminho do arquivo temporário e nome do arquivo com extensão .pdf (importante!)
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')
    // salvar temporariamente o arquivo
    doc.save(filePath)
    // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }

}

// == Fim - relatorio de clientes ===============
// ==============================================


// ==============================================================================================
// == CRUD Read =================================================================================

ipcMain.on('search-name', async (event, cliName) => {
  //teste de recebimento do nome do cliente (passo2)
  console.log(cliName)
  try {
    // Passos 3 e 4 (Busca dos dados do cliente pelo nome) 
    // RegEXP (expressãoi regular 'i' -> insentive (ignorar letra maiúsculas ou minúsculas))
    const client = await clienteModel.find({
      nome: new RegExp(cliName, 'i')
    })
    //teste da busca do cliente pelo nome (Passos 3 e 4)
    console.log(client)
    // Enviar ao renderizador (rendererCliente) os dados do cliente (passo 5) OBS: Não esquecer de converter para string "JSON"
    event.reply('render-client', JSON.stringify(client))
  } catch (error) {
    console.log(error)
  }
})


// == Fim CRUD Read =============================================================================
// ==============================================================================================

