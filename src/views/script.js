console.log("olá, mundo")


function buscarEndereco() {
    let cep = document.getElementById('cep').value
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`

    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            document.getElementById('logradouro').value = dados.logradouro
            document.getElementById('bairro').value = dados.bairro
            document.getElementById('cidade').value = dados.localidade
            document.getElementById('uf').value = dados.uf;
        })
        .catch(error => console.error('Erro ao buscar o endereço:', error))
}

function limparFormulario() {
    document.getElementById("cadastro").reset();
    document.getElementById("cpfErro").style.display = "none";
    document.getElementById("mensagemSucesso").style.display = "none";
}

function validarCPF() {
    let cpf = document.getElementById("cpf").value.replace(/\D/g, '');
    let cpfErro = document.getElementById("cpfErro");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        cpfErro.style.display = "block";
        return false;
    }
    
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) {
        cpfErro.style.display = "block";
        return false;
    }
    
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) {
        cpfErro.style.display = "block";
        return false;
    }
    
    cpfErro.style.display = "none";
    return true;
}

function validarFormulario(event) {
    event.preventDefault();
    let form = document.getElementById("cadastro");
    let inputs = form.querySelectorAll("input[required]");
    let valido = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            valido = false;
        }
    });

    if (!validarCPF()) {
        valido = false;
    }

    if (valido) {
        document.getElementById("mensagemSucesso").style.display = "block";
        form.reset();
    }
}