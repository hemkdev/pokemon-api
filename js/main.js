// fetch = Function used for making HTTP requests to fetch resources.
//              (JSON style data, images, files)
//              Simplifies asynchronous data fetching in JavaScript and
//              used for interacting with APIs to retrieve and send
//              data asynchronously over the web.
//              fetch(url, {options})

async function fetchData(){

    try{

        const pokemonName = document.getElementById("pokemonName").value.toLowerCase();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if(!response.ok){
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        const imgElement = document.getElementById("pokemonSprite");

        // choose the best available sprite URL from the API response
        const spriteCandidates = [
            data.sprites?.other?.['official-artwork']?.front_default,
            data.sprites?.other?.home?.front_default,
            data.sprites?.other?.dream_world?.front_default,
            data.sprites?.front_default,
            data.sprites?.front_shiny,
            data.sprites?.back_default
        ];

        const spriteUrl = spriteCandidates.find(u => !!u) || null;

        // small inline SVG placeholder (data URI) used when no sprite exists or fails to load
        const placeholderSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'>
            <rect width='400' height='400' fill='%23f3f4f6'/>
            <g fill='%239ca3af'>
                <circle cx='200' cy='160' r='80'/>
                <rect x='60' y='260' width='280' height='60' rx='12'/>
            </g>
            <text x='200' y='360' font-size='28' fill='%236b7280' text-anchor='middle' font-family='Arial, Helvetica, sans-serif'>No image</text>
        </svg>`;
        const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(placeholderSVG);

        // Always show a placeholder first to avoid flashes/black squares
        imgElement.src = placeholder;
        imgElement.alt = `${data.name} (loading)`;
        imgElement.style.display = 'block';

        if (spriteUrl) {
            // Preload the sprite with a temporary Image to verify it's valid and not tiny/invalid
            const probe = new Image();
            // try to avoid CORS tainting if possible; some hosts block crossOrigin
            probe.crossOrigin = 'anonymous';
            probe.src = spriteUrl;
            probe.onload = () => {
                const tooSmall = (probe.naturalWidth || 0) < 32 || (probe.naturalHeight || 0) < 32;
                if (!tooSmall) {
                    // valid-looking image: use it
                    imgElement.src = spriteUrl;
                    imgElement.alt = `${data.name} sprite`;
                    imgElement.style.display = 'block';
                } else {
                    // too small - keep placeholder
                    console.debug('sprite too small, using placeholder for', data.name, probe.naturalWidth, probe.naturalHeight);
                    imgElement.src = placeholder;
                    imgElement.alt = `${data.name} (no image)`;
                }
            };
            probe.onerror = () => {
                // network or decode error - keep placeholder
                console.debug('sprite failed to load, using placeholder for', data.name, spriteUrl);
                imgElement.src = placeholder;
                imgElement.alt = `${data.name} (no image)`;
            };
        } else {
            // no sprite available — keep placeholder
            imgElement.src = placeholder;
            imgElement.alt = `${data.name} (no image)`;
        }

        // show name
        const displayName = document.getElementById('pokemonDisplayName');
        displayName.textContent = `${data.name}`;
        displayName.style.display = 'block';

        // show types
        const typesContainer = document.getElementById('pokemonTypes');
        const typesList = document.getElementById('typesList');
        typesList.innerHTML = '';
        data.types.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t.type.name;
            typesList.appendChild(li);
        });
        typesContainer.style.display = 'block';

        // show stats
        const statsContainer = document.getElementById('pokemonStats');
        const statsTableBody = document.querySelector('#statsTable tbody');
        statsTableBody.innerHTML = '';
        data.stats.forEach(s => {
            const tr = document.createElement('tr');
            const nameTd = document.createElement('td');
            const valueTd = document.createElement('td');
            nameTd.textContent = s.stat.name;
            valueTd.textContent = s.base_stat;
            tr.appendChild(nameTd);
            tr.appendChild(valueTd);
            statsTableBody.appendChild(tr);
        });
        statsContainer.style.display = 'block';

        // clear message
        const message = document.getElementById('message');
        message.textContent = '';
    }
    catch(error){
        console.error(error);
        const message = document.getElementById('message');
        message.textContent = 'Pokémon not found or error fetching data.';

        // hide other UI elements
        document.getElementById('pokemonSprite').style.display = 'none';
        document.getElementById('pokemonDisplayName').style.display = 'none';
        document.getElementById('pokemonTypes').style.display = 'none';
        document.getElementById('pokemonStats').style.display = 'none';
    }
}