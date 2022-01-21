function script() { // Suorittaa funktion DOM:in latauduttua

    // Asettaa paikkakunnat ja niiden valuet dropdown menuun "valitse paikkakunta"

    var xmlhttp = new XMLHttpRequest(); // Luo uuden xmlhttprequestin
    xmlhttp.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/", true); // Hakee datan annetusta xml tiedostosta
    xmlhttp.send(); // Lähettää AJAX pyynnön
    xmlhttp.onreadystatechange = function () { // Lisää eventlistenerin AJAX kutsulle
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) { // Suoritetaan jos AJAX pyyntö on valmis ja status OK
            var theatreAreas = xmlhttp.responseXML; // Asettaa xml vastauksen muuttujaan
            var theatres = theatreAreas.getElementsByTagName("Name"); // Asettaa xml dokumentin "Name" tagin muuttujaan
            var ID = theatreAreas.getElementsByTagName("ID"); // Asettaa xml dokumentin "ID" tagin muuttujaan

            var setTheaters = document.getElementById("selectTheater"); // Asettaa DOM:n "Valitse elokuva/teatteri" dropdownin muuttujaan
            for (i = 0; i < theatres.length; i++) { // Käy läpi kaikki xml dokumentissa olevat elokuvat
                var theatre = document.createElement("option"); // Luo uuden option ja asettaa sen muuttujaan
                theatre.innerText = theatres[i].childNodes[0].nodeValue; // Lisää muuttujaan teatterin nimen
                theatre.value = ID[i].childNodes[0].nodeValue; // Lisää muuttujaan teatterin valuen
                setTheaters.appendChild(theatre); // Asettaa option dropdownlistaan
            }
        }
    }

    // Asettaa päivämäärät ja niiden valuet dropdown menuun "valitse päivämäärä"

    var setDates = Array.from(document.getElementById("selectDate").options); // Asettaa muuttujaan Dropdown menun optiot
    for (i = 0; i < setDates.length; i++) { // Käy läpi jokaisen option
        var date = new Date(); // Luo uuden päivämäärämuuttuja
        date.setDate(date.getDate() + i); // Kasvattaa päivämäärää muuttujalla i

        // Asettaa jokaiselle optiolle uuden valuen (koostuu päivämääristä)
        if (date.getDate() < 10 && date.getMonth() < 10) {
            setDates[i].value = "0" + date.getDate() + "." + "0" + (date.getMonth() + 1) + "." + date.getFullYear();
        } else if (date.getDate() < 10) {
            setDates[i].value = "0" + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
        } else if (date.getMonth() < 10) {
            setDates[i].value = date.getDate() + "." + "0" + (date.getMonth() + 1) + "." + date.getFullYear();
        } else {
            setDates[i].value = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
        }

        if (i === 0) {
            setDates[i].innerHTML = "Tänään, " + setDates[i].value; // Jos valuen indexi = 0, lisätään teksiin "tänään" + pvm
        } else if (i === 1) {
            setDates[i].innerHTML = "Huomenna, " + setDates[i].value; // Jos valuen indexi = 1, lisätään teksiin "huomenna" + pvm
        } else {
            setDates[i].innerHTML = setDates[i].value; // Muutoin lisätään tekstiksi muuttujassa oleva pvm
        }
    }

    // Luo elokuvahakua
    var xmlhttp1 = new XMLHttpRequest(); // Luo uuden xmlhttprequestin
    xmlhttp1.open("GET", "https://www.finnkino.fi/xml/Events/", true); // Hakee datan annetusta xml tiedostosta
    xmlhttp1.send(); // Lähettää AJAX pyynnön
    xmlhttp1.onreadystatechange = function () { // Lisää eventlistenerin AJAX kutsulle
        if (xmlhttp1.readyState == 4 && xmlhttp1.status == 200) { // Suoritetaan jos AJAX pyyntö on valmis ja status OK
            var events = xmlhttp1.responseXML; // Asettaa xml vastauksen muuttujaan
            var ongoingMovies = events.getElementsByTagName("Title"); // Asettaa muuttujaan xml dokumentin "Title" nimiset tagit
            var setOngoingMovies = document.getElementById("moviesOption"); // Asettaa DOM:n "Hae elokuvaa nimellä" hakukentän muuttujaan
            for (i = 0; i < ongoingMovies.length; i++) { // Käy läpi kaikki xml dokumentissa olevat elokuvat
                try {
                    if (ongoingMovies[i].childNodes[0].nodeValue === "Traileri" || ongoingMovies[i].childNodes[0].nodeValue === "") {
                        continue // Jos titlen arvo on traileri tai tyhjä, jatketaan suoritusta ottamatta näitä 
                    }
                    var ongoingMoviesOption = document.createElement("option"); // Luo uuden option elementin ja asettaa sen muuttujaan
                    ongoingMoviesOption.innerText = ongoingMovies[i].childNodes[0].nodeValue; // Lisää muuttujaan elokuvan nimen
                    setOngoingMovies.appendChild(ongoingMoviesOption); // Asettaa optionin datalistaan
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
}

// Suoritetaan klikatessa "searchBtn":a

document.getElementById("searchBtn").addEventListener("click", searchMovies); // Lisätään eventlistener etsi näppäimelle
function searchMovies() { // Suoritetaan funktio

    document.getElementById("card-container").innerHTML = ""; // Tyhjentää haetut elokuvat DOM:sta
    var movieArea = document.getElementById("selectTheater"); // Asettaa muuttujaan "valitse paikkakunta" dropdownin 
    var movieDate = document.getElementById("selectDate"); // Asettaa muuttujaan "valitse päivämäärä" dropdownin
    var movieSearchTitle = document.getElementById("movieSearch"); // Asettaa elokuvahaun muuttujaan

    if (movieArea.value === "1029") { // Jos paikkakuntaa ei ole valittu...
        movieArea.classList.add("error"); // ...lisätään "valitse paikkakunta" dropdown menulle error luokka
    } else { // Suoritetaan näytöshaku
        document.body.style.backgroundImage = 'none'; // Piilotetaan bodyn taustakuva
        movieArea.classList.remove("error"); //... poistetaan error luokka "valitse paikkakunta" dropdown menusta 

        const apiUrl = new URL("https://www.finnkino.fi/xml/Schedule/?area=&dt=") // Asettaa xml url muuttujaan
        apiUrl.searchParams.set("area", movieArea.value); // Asettaa url:n parametriin "area" valitun paikkakunnan arvo
        apiUrl.searchParams.set("dt", movieDate.value); // Asettaa url:n parametriin "dt" valitun päivämäärän arvo
        var xmlhttp = new XMLHttpRequest(); // Luo uuden xmlhttprequestin
        xmlhttp.open("GET", apiUrl, true); // Hakee datan annetusta xml tiedostosta
        xmlhttp.send(); // Lähettää AJAX pyynnön

        xmlhttp.onreadystatechange = function () { // Lisää eventlistenerin AJAX kutsulle
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) { // Suoritetaan jos AJAX pyyntö on valmis ja status OK
                var moviesInTheatre = xmlhttp.responseXML; // Asettaa xml vastauksen muuttujaan

                var movieTitles = moviesInTheatre.getElementsByTagName("Title"); // Asettaa muuttujaan xml dokumentin "title" nimiset tagit
                var movieTheatres = moviesInTheatre.getElementsByTagName("Theatre"); // Asettaa muuttujaan xml dokumentin "Theatre" nimiset tagit
                var movieStarts = moviesInTheatre.getElementsByTagName("dttmShowStart"); // Asettaa muuttujaan xml dokumentin "dttmShowStart" nimiset tagit
                var eventID = moviesInTheatre.getElementsByTagName("EventID"); // Asettaa muuttujaan xml dokumentin "EventID" tagit
                var movieImages = moviesInTheatre.getElementsByTagName("EventMediumImagePortrait"); // Asettaa muuttujaan xml dokumentin medium kokoiset kuvat


                if (movieSearchTitle.value === "") { // Suoritetaan, jos näytöshaun tekstikenttä on tyhjä
                    for (i = 0; i < movieTitles.length; i++) { // Käy läpi kaikki xml dokumentissa olleet elokuvat
                        createMovieElement(movieTitles, movieTheatres, movieStarts, eventID, movieImages);
                    }
                } else {  // Tekee muuten saman kuin yllä, mutta ottaa huomioon elokuvahakukentän arvon    
                    var movie = movieSearchTitle.value;
                    for (i = 0; i < movieTitles.length; i++) { // Käy läpi kaikki xml dokumentissa olleet elokuvat
                        if (movieTitles[i].childNodes[0].nodeValue.toUpperCase().includes(movie.toUpperCase())) {
                            createMovieElement(movieTitles, movieTheatres, movieStarts, eventID, movieImages);
                        }
                    }
                }

                if (document.getElementById("card-container").childNodes.length === 0) { // Suoritetaan jos elokuvahaku ei anna tuloksia
                    var cardContainer = document.getElementById("card-container"); // Asettaa card-contrainerin muuttujaan
                    var row = document.createElement("div");  // Luo div elementin...
                    row.className = "row"; // ...ja antaa sille luokan row

                    var cardBody = document.createElement("div"); // Luo uuden divin...
                    cardBody.className = "card-body noShows"; // ...ja antaa sille luokan card-body
                    cardBody.innerText = "Sori tonttu, ei näytöksiä."; // Lisää card-bodyyn teksin

                    var images = document.createElement("img"); // Luo uuden kuva elementin
                    images.src = "../images/tonttu.jpg"; // Kuvan lähde
                    images.alt = "Tonttu"; // Kuval alt teksti
                    images.className = "imgTonttu"; // Lisää kuvalle luokan

                    cardBody.appendChild(images); // Liittää kuvan card-bodyyn
                    row.appendChild(cardBody); // Liittää card-bodyn riviin
                    cardContainer.appendChild(row); // Liittää rivin DOM:n cardContaineriin
                }
            }
        }
    }
}

document.getElementById("movieSearch").addEventListener("keyup", enterClick); // elokuvahakuun eventlistener, kun näppäin nousee
function enterClick(e) { // Suorittaa funktion
    if (e.keyCode === 13) { // Jos näppäin on enter näppäin...
        searchMovies(); // ...suoritetaan elokuvahaku
    }
}

function createMovieElement(movieTitles, movieTheatres, movieStarts, eventID, movieImages) {

    var cardContainer = document.getElementById("card-container"); // Asettaa card-contrainerin muuttujaan
    var row = document.createElement("div"); // Luo uuden div elementin...
    row.className = "row"; //...ja antaa sille luokan

    var imgdiv = document.createElement("div"); // Luo uuden div elementin...
    imgdiv.className = "col-xs-2"; //...ja antaa sille luokan

    var images = document.createElement("img"); // Luo uuden kuva elementin
    images.src = movieImages[i].childNodes[0].nodeValue; // Asettaa elemnttiin kuvan xml tiedostosta
    images.alt = "Elokuvan mainosjuliste"; // Antaa kuvalle alt tekstin
    images.className = "img"; // Antaa kuvalle luokan

    var card = document.createElement("div"); // Luo uuden divin...
    card.className = "card shadow"; // ...ja lisää sille luokan card

    var cardBody = document.createElement("div"); // Luo uuden divin...
    cardBody.className = "card-body col-xs-10"; // ...ja antaa sille luokan card-body

    var title = document.createElement("h5"); // Luo uuden h5...
    title.innerText = movieTitles[i].childNodes[0].nodeValue; // ...ja lisää sen tekstiksi elokuvan nimen...
    title.className = "card-title"; //...jolle antaa luokan card-title

    var movieInfo = document.createElement("div"); // Luo uuden divin
    var dateAndTime = movieStarts[i].childNodes[0].nodeValue; // Asettaa muuttujaan näytöksen pvm ja kellonajan
    var movieEventID = eventID[i].childNodes[0].nodeValue;
    movieInfo.innerText = movieTheatres[i].childNodes[0].nodeValue + "\n" // Asettaa teatterin tiedot divin tekstiksi
        + dateAndTime.substring(11, 16) + "\n\n"; // Poimii muuttujasta kellonaikatiedot jotka lisää divin tekstiksi

    movieInfo.className = "card-movieinfo"; // Antaa diville luokan card-movieinfo

    var varaa = document.createElement('a');
    varaa.className = "varaa";
    var link = document.createTextNode("Varaa");
    varaa.appendChild(link);
    varaa.title = "Varaa";
    varaa.target = "_blank";
    varaa.href = "https://www.finnkino.fi/event/" + movieEventID;


    imgdiv.appendChild(images); // Liittää kuvan imgdiviin
    row.appendChild(imgdiv); // Liittää imgdivin riviin
    cardBody.appendChild(title); // Liittää elokuvan nimen cardBodyyn
    cardBody.appendChild(movieInfo); // Liittää elokuvan näytösajan cardBodyyn
    cardBody.appendChild(varaa);
    row.appendChild(cardBody); //Liittää cardbodyn riviin
    card.appendChild(row); // Liittää cardBodyn cardiin
    cardContainer.appendChild(card); // Vie cardin DOM:n cardContaineriin

}