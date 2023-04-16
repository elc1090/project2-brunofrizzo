// Get the GitHub username input form
const formFipe = document.getElementById('formFipe');
const selectMarca = document.getElementById('selectMarca');
const selectModelo = document.getElementById('selectModelo');
const selectAno = document.getElementById('selectAno');
const buttonSubmit = document.getElementById('buttonSubmit');

fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas').then(response => response.json())
.then(data => {
    if (data) {
        data.forEach(element => {
            let option = document.createElement('option');
            option.value = element.codigo;
            option.innerHTML = element.nome;
            selectMarca.appendChild(option);
        })
    }
})

// Listen for submissions on GitHub username input form
formFipe.addEventListener('submit', (e) => {
    e.preventDefault();

    let gitHubUsername = document.getElementById('usernameInput').value;
    let repositoryName = document.getElementById('repositorySelect').value;

    if (gitHubUsername && repositoryName) {
        inputSubmit.value = 'Buscando commits...';
        inputSubmit.disabled = true;

        requestRepoCommits(gitHubUsername, repositoryName)
            .then(response => response.json()) // parse response into json
            .then(data => {
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

                inputSubmit.disabled = false;
                inputSubmit.value = 'Buscar';
            })
    }
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
            console.log(data)
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

function buscarModelos(codigoMarca) {
    return Promise.resolve(fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codigoMarca}/modelos`));
}

function buscarAnos(codigoMarca, codigoModelo) {
    return Promise.resolve(fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codigoMarca}/modelos/${codigoModelo}/anos`));
}