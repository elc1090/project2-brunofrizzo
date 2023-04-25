// Get the GitHub username input form
const formFipe = document.getElementById('formFipe');
const selectTipo = document.getElementById('selectTipo');
const selectMarca = document.getElementById('selectMarca');
const selectModelo = document.getElementById('selectModelo');
const selectAno = document.getElementById('selectAno');
const buttonSubmit = document.getElementById('buttonSubmit');

// Listen for submissions on GitHub username input form
formFipe.addEventListener('submit', (e) => {
    e.preventDefault();

    let tipoVeiculo = selectTipo.value;
    let marca = selectMarca.value;
    let modelo = selectModelo.value;
    let ano = selectAno.value;

    if (tipoVeiculo && marca && modelo && ano) {
        buttonSubmit.value = 'Buscando...';
        buttonSubmit.disabled = true;

        buscarHistoricoPrecos(tipoVeiculo, marca, modelo, ano)
            .then(response => response.json()) // parse response into json
            .then(data => {
                console.log(data);
                return;

                if (data) {
                    let ul = document.getElementById('repoCommits');
                    ul.innerHTML = "";

                    for (let i in data) {
                        let li = document.createElement('li');
                        li.classList.add('list-group-item')

                        let commitDate = new Date(data[i].commit.committer.date).toLocaleString();

                        li.innerHTML = (`
                        <div class='parent'>
                            <div class='child' style="display: inline-block; vertical-align: middle;">
                                <img style="width: 50px; height:50px; border-radius: 12%;" src="${data[i].author.avatar_url}">
                            </div>
                            <div class='child' style="display: inline-block; vertical-align: middle;">
                                <strong>${data[i].author.login}</strong>
                                <br>
                                ${commitDate}
                            </div>
                        </div>
                        <p><br><strong>Commit:</strong> ${data[i].commit.message}</p>
                    `);

                        ul.appendChild(li);
                    }
                }

                buttonSubmit.disabled = false;
                buttonSubmit.value = 'Buscar';
            })
    }
})

selectTipo.addEventListener('change', (e) => {
    e.preventDefault();
    selectMarca.disabled = true;
    selectModelo.disabled = true;
    buttonSubmit.disabled = true;
    selectAno.innerHTML = '';
    selectMarca.innerHTML = '';
    selectModelo.innerHTML = '';

    let tipoVeiculo = selectTipo.value;

    buscarMarcas(tipoVeiculo)
        .then(response => response.json())
        .then(data => {
            if (data) {
                let option = document.createElement('option');
                option.value = '';
                option.innerHTML = 'Selecione uma marca';
                selectMarca.appendChild(option);
                data.forEach(element => {
                    let option = document.createElement('option');
                    option.value = element.codigo;
                    option.innerHTML = element.nome;
                    selectMarca.appendChild(option);
                })
            }
            selectMarca.disabled = false;
            selectModelo.disabled = false;
            buttonSubmit.disabled = false;
        })
})

selectMarca.addEventListener('change', (e) => {
    e.preventDefault();
    selectModelo.disabled = true;
    buttonSubmit.disabled = true;
    selectAno.innerHTML = '';

    let codigoMarca = selectMarca.value;

    buscarModelos(codigoMarca)
        .then(response => response.json())
        .then(data => {
            if(data) {
                selectModelo.innerHTML = '';

                let option = document.createElement('option');
                option.value = '';
                option.innerHTML = 'Selecione um modelo';
                selectModelo.appendChild(option);

                data.modelos.forEach(element => {
                    let option = document.createElement('option');
                    option.value = element.codigo;
                    option.innerHTML = element.nome;
                    selectModelo.appendChild(option);
                })
            }

            selectModelo.disabled = false;
            buttonSubmit.disabled = false;
        })
})

selectModelo.addEventListener('change', (e) => {
    e.preventDefault();
    selectAno.disabled = true;
    buttonSubmit.disabled = true;

    let codigoModelo = selectModelo.value;
    let codigoMarca = selectMarca.value;

    buscarAnos(codigoMarca, codigoModelo)
        .then(response => response.json())
        .then(data => {
            if (data) {
                selectAno.innerHTML = '';
                data.forEach(element => {
                    let option = document.createElement('option');
                    option.value = element.codigo;
                    option.innerHTML = element.nome;
                    selectAno.appendChild(option);
                })
            }

            selectAno.disabled = false;
            buttonSubmit.disabled = false;
        })
})


function buscarMarcas(tipo) {
    return Promise.resolve(fetch(`https://parallelum.com.br/fipe/api/v1/${tipo}/marcas`));
}

function buscarModelos(codigoMarca) {
    return Promise.resolve(fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codigoMarca}/modelos`));
}

function buscarAnos(codigoMarca, codigoModelo) {
    return Promise.resolve(fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codigoMarca}/modelos/${codigoModelo}/anos`));
}

function buscarHistoricoPrecos(tipo, codigoMarca, codigoModelo, ano) {
    //GET: https://parallelum.com.br/fipe/api/v1/carros/marcas/59/modelos/5940/anos/2014-3
    return Promise.resolve(fetch(`https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${codigoMarca}/modelos/${codigoModelo}/anos/${ano}`));
}