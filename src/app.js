// Get the GitHub username input form
const formFipe = document.getElementById('formFipe');
const selectTipo = document.getElementById('selectTipo');
const selectMarca = document.getElementById('selectMarca');
const selectModelo = document.getElementById('selectModelo');
const selectAno = document.getElementById('selectAno');
const buttonSubmit = document.getElementById('buttonSubmit');
const divResultado = document.getElementById('divResultado');

var anos;
var chart = null;

// Listen for submissions on GitHub username input form
formFipe.addEventListener('submit', (e) => {
    e.preventDefault();

    divResultado.style.display = 'none';

    let tipoVeiculo = selectTipo.value;
    let marca = selectMarca.value;
    let modelo = selectModelo.value;
    let ano = selectAno.value.split('_')[1];
    let indiceAno = selectAno.value.split('_')[0];

    if (tipoVeiculo && marca && modelo && ano) {
        buttonSubmit.textContent = 'Buscando...';
        buttonSubmit.disabled = true;

        buscarHistoricoPrecos(tipoVeiculo, marca, modelo, ano)
            .then(response => response.json()) // parse response into json
            .then(async data => {
                var colunaModeloCarro = document.getElementById('modeloCarro');
                var colunaAnoCarro = document.getElementById('anoCarro');
                var colunaPrecoCarro = document.getElementById('precoCarro');

                colunaModeloCarro.innerHTML = data.Marca + ' ' + data.Modelo;
                colunaAnoCarro.innerHTML = data.AnoModelo;
                colunaPrecoCarro.innerHTML = data.Valor;

                await montarGrafico(tipoVeiculo, marca, modelo, indiceAno, data.AnoModelo, data.Valor);

                buttonSubmit.disabled = false;
                buttonSubmit.textContent = 'Consultar';
                divResultado.style.display = 'block';
                divResultado.scrollIntoView();
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
            anos = data;
            
            if (data) {
                selectAno.innerHTML = '';
                data.forEach((element,index) => {
                    let option = document.createElement('option');
                    option.value = index + '_' +element.codigo;
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

async function montarGrafico(tipo, codigoMarca, codigoModelo, indiceAno, ano, valor) {
    var indices = [];
    var labels = [];
    var dadosGrafico = [];

    labels.push(ano);
    dadosGrafico.push(reaisParaCentavos(valor.split("R$ ")[1]));
    indiceAno++;

    if (indiceAno <= anos.length) {
        for(let i = 0; i < 5; i++) {
            if (anos[indiceAno]) {
                indices.push(indiceAno)
        
                await buscarHistoricoPrecos(tipo, codigoMarca, codigoModelo, anos[indiceAno].codigo)
                    .then(response => response.json())
                    .then(data => {
                        let valorCarro = data.Valor.split("R$ ")[1];
                        dadosGrafico.push(reaisParaCentavos(valorCarro))
                        labels.push(data.AnoModelo)
                    })

                indiceAno++;
            }
        }

        preencherGrafico(labels, dadosGrafico);
    }
}

function preencherGrafico(labels, data) {
    const ctx = document.getElementById('priceChart');

    if (chart)
        chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.reverse(),
            datasets: [{
                label: 'Valor',
                data: data.reverse(),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function (value, index, values) {
                            let valueWithoutDecimal = parseInt(value/100);
                            return valueWithoutDecimal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                let = valueWithoutDecimal = parseInt(context.parsed.y / 100);
                                label += new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueWithoutDecimal);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function reaisParaCentavos(value) {
    var int = value.split(",")[0];
    var decimal = value.split(",")[1];

    int = int.replace(".", "");
    var cents = parseInt(decimal) + (parseInt(int) * 100);

    return cents;
}