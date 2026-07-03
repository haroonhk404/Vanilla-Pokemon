var PAGE_SIZE = 20;
var offset = 0;
var allData = [];

var API = 'https://pokeapi.co/api/v2';

function spriteUrl(id){
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

function idFromUrl(url) {
    const parts = url.split("/")
    return parts[parts.length - 2]
}

function renderPokemnon(pokemon){
    console.log("pokemon",pokemon)
    return `
  <a class="card" href="detail.html?id=${pokemon.id}">
      <img class="card__img" src="${spriteUrl(pokemon.id)}" alt="${pokemon.name}" loading="lazy" />
    <div class="card__id">#${String(pokemon.id).padStart(3, '0')}</div>
    <h3 class="card__name">${pokemon.name}</h3>
  </a>
`;

}

function renderGrid(){
   const pokemonHtml =  allData.map((p)=>{
       return renderPokemnon(p)
    })
    $("#grid").html(pokemonHtml);
}

function loadPage() {
    $('#load-more').prop('disabled', true)
    $('#status').text('Loading..')

    $.getJSON(`${API}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`)
        .done(function (data) {

            const pokemonData = data.results.map((p) => {
                return { name: p.name, id: Number(idFromUrl(p.url)) }
            })

            allData.push(...pokemonData);
            console.log("pokemonData", allData)
            // RENDER DATA
            renderGrid();
            //UPDATE status
            $('#status').text('');
            $('#load-more').prop('disabled', false);

        })

        .fail(function () {
            $('#status').text('Something went wrong. Check your connection and try again.');
            $('#load-more').prop('disabled', false);
        })

}

$("#load-more").on("click", function() {
    offset = offset + PAGE_SIZE;
    loadPage();
});

loadPage();