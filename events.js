function script() { // Suorittaa funktion DOM:in latauduttua

    // Asettaa paikkakunnat ja niiden valuet dropdown menuun "valitse paikkakunta"

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/", true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var theatreAreas = xmlhttp.responseXML;
            var theatres = theatreAreas.getElementsByTagName("Name");
            var ID = theatreAreas.getElementsByTagName("ID");

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
    var xmlhttp1 = new XMLHttpRequest();
    xmlhttp1.open("GET", "https://www.finnkino.fi/xml/Events/", true);
    xmlhttp1.send();
    xmlhttp1.onreadystatechange = function () {
        if (xmlhttp1.readyState == 4 && xmlhttp1.status == 200) {
            var events = xmlhttp1.responseXML;
            var ongoingMovies = events.getElementsByTagName("Title");
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

document.getElementById("searchBtn").addEventListener("click", searchMovies);
function searchMovies() {

    document.getElementById("card-container").innerHTML = ""; // Tyhjentää haetut elokuvat DOM:sta
    var movieArea = document.getElementById("selectTheater"); // Asettaa muuttujaan "valitse paikkakunta" dropdownin 
    var movieDate = document.getElementById("selectDate"); // Asettaa muuttujaan "valitse päivämäärä" dropdownin
    var movieSearchTitle = document.getElementById("movieSearch"); // Asettaa elokuvahaun muuttujaan

    if (movieArea.value === "1029") { // Jos paikkakuntaa ei ole valittu...
        movieArea.classList.add("error"); // ...lisätään "valitse paikkakunta" dropdown menulle error luokka
    } else {

        document.body.style.backgroundImage='none';
        movieArea.classList.remove("error"); //... poistetaan error luokka "valitse paikkakunta" dropdown menusta 

        const apiUrl = new URL("https://www.finnkino.fi/xml/Schedule/?area=&dt=") // Asettaa xml url muuttujaan
        apiUrl.searchParams.set("area", movieArea.value); // Asettaa url:n parametriin "area" valitun paikkakunnan arvo
        apiUrl.searchParams.set("dt", movieDate.value); // Asettaa url:n parametriin "dt" valitun päivämäärän arvo
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", apiUrl, true);
        xmlhttp.send();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var moviesInTheatre = xmlhttp.responseXML;

                var movieTitles = moviesInTheatre.getElementsByTagName("Title"); // Asettaa muuttujaan xml dokumentin "title" nimiset tagit
                var movieTheatres = moviesInTheatre.getElementsByTagName("Theatre");
                var movieStarts = moviesInTheatre.getElementsByTagName("dttmShowStart"); // Asettaa muuttujaan xml dokumentin "dttmShowStart" nimiset tagit
                var movieImages = moviesInTheatre.getElementsByTagName("EventMediumImagePortrait");


                if (movieSearchTitle.value === "") { // Suoritetaan, jos elokuvahaku on tyhjä
                    for (i = 0; i < movieTitles.length; i++) { // Käy läpi kaikki xml dokumentissa olleet elokuvat

                        var cardContainer = document.getElementById("card-container"); // Asettaa card-contrainerin muuttujaan
                        var row = document.createElement("div");
                        row.className = "row";

                        var imgdiv = document.createElement("div");
                        imgdiv.className = "col-xs-2";

                        var images = document.createElement("img");
                        images.src = movieImages[i].childNodes[0].nodeValue;
                        images.alt = "Elokuvan mainosjuliste";
                        images.className = "img";

                        var card = document.createElement("div"); // Luo uuden divin...
                        card.className = "card shadow"; // ...ja lisää sille luokan card

                        var cardBody = document.createElement("div"); // Luo uuden divin...
                        cardBody.className = "card-body col-xs-10"; // ...ja antaa sille luokan card-body

                        var title = document.createElement("h5"); // Luo uuden h5...
                        title.innerText = movieTitles[i].childNodes[0].nodeValue; // ...ja lisää sen tekstiksi elokuvan nimen...
                        title.className = "card-title"; //...jolle antaa luokan card-title

                        var movieInfo = document.createElement("div"); // Luo uuden divin
                        var dateAndTime = movieStarts[i].childNodes[0].nodeValue; // Asettaa muuttujaan näytöksen pvm ja kellonajan
                        movieInfo.innerText = movieTheatres[i].childNodes[0].nodeValue + "\n" // Asettaa teatterin tiedot divin tekstiksi
                            + dateAndTime.substring(11, 16); // Poimii muuttujasta kellonaikatiedot jotka lisää divin tekstiksi
                        movieInfo.className = "card-movieinfo"; // Antaa diville luokan card-movieinfo


                        imgdiv.appendChild(images);
                        row.appendChild(imgdiv);
                        cardBody.appendChild(title); // Lisää elokuvan nimen cardBodyyn
                        //  cardBody.appendChild(teatteri);
                        cardBody.appendChild(movieInfo); // Lisää elokuvan näytösajan cardBodyyn
                        row.appendChild(cardBody);
                        card.appendChild(row); // Lisää cardBodyn cardiin
                        cardContainer.appendChild(card); // Vie cardin DOM:n cardContaineriin

                    }
                } else {  // Tekee muuten saman kuin yllä, mutta ottaa huomioon elokuvahakukentän arvon
                    var movie = movieSearchTitle.value;
                    for (i = 0; i < movieTitles.length; i++) { // Käy läpi kaikki xml dokumentissa olleet elokuvat

                        if (movieTitles[i].childNodes[0].nodeValue.toUpperCase().includes(movie.toUpperCase())) {
                            var cardContainer = document.getElementById("card-container"); // Asettaa card-contrainerin muuttujaan
                            var row = document.createElement("div");
                            row.className = "row";

                            var imgdiv = document.createElement("div");
                            imgdiv.className = "col-xs-2";

                            var images = document.createElement("img");
                            images.src = movieImages[i].childNodes[0].nodeValue;
                            images.alt = "Elokuvan mainosjuliste";
                            images.className = "img";

                            var card = document.createElement("div"); // Luo uuden divin...
                            card.className = "card shadow"; // ...ja lisää sille luokan card

                            var cardBody = document.createElement("div"); // Luo uuden divin...
                            cardBody.className = "card-body col-xs-10"; // ...ja antaa sille luokan card-body

                            var title = document.createElement("h5"); // Luo uuden h5...
                            title.innerText = movieTitles[i].childNodes[0].nodeValue; // ...ja lisää sen tekstiksi elokuvan nimen...
                            title.className = "card-title"; //...jolle antaa luokan card-title

                            var movieInfo = document.createElement("div"); // Luo uuden divin
                            var dateAndTime = movieStarts[i].childNodes[0].nodeValue; // Asettaa muuttujaan näytöksen pvm ja kellonajan
                            movieInfo.innerText = movieTheatres[i].childNodes[0].nodeValue + "\n" // Asettaa teatterin tiedot divin tekstiksi
                                + dateAndTime.substring(11, 16); // Poimii muuttujasta kellonaikatiedot jotka lisää divin tekstiksi
                            movieInfo.className = "card-movieinfo"; // Antaa diville luokan card-movieinfo


                            imgdiv.appendChild(images);
                            row.appendChild(imgdiv);
                            cardBody.appendChild(title); // Lisää elokuvan nimen cardBodyyn
                            //  cardBody.appendChild(teatteri);
                            cardBody.appendChild(movieInfo); // Lisää elokuvan näytösajan cardBodyyn
                            row.appendChild(cardBody);
                            card.appendChild(row); // Lisää cardBodyn cardiin
                            cardContainer.appendChild(card); // Vie cardin DOM:n cardContaineriin

                        }
                    }
                }

                if (document.getElementById("card-container").childNodes.length === 0) {
                    var cardContainer = document.getElementById("card-container"); // Asettaa card-contrainerin muuttujaan
                    var row = document.createElement("div");
                    row.className = "row";

                    var cardBody = document.createElement("div"); // Luo uuden divin...
                    cardBody.className = "card-body noShows"; // ...ja antaa sille luokan card-body
                    cardBody.innerText = "Sori tonttu, ei näytöksiä.";

                    var images = document.createElement("img");
                    images.src = "../images/tonttu.jpg";
                    images.alt = "Tonttu";
                    images.className = "imgTonttu";

                    cardBody.appendChild(images);
                    row.appendChild(cardBody);
                    cardContainer.appendChild(row); // Vie cardin DOM:n cardContaineriin
                }
            }
        }
    }
}

document.getElementById("movieSearch").addEventListener("keyup", enterClick); // elokuvahakuun eventlistener, kun näppäin nousee
function enterClick(e) {
    if (e.keyCode === 13) { // Jos näppäin on enter näppäin...
        searchMovies(); // ...suoritetaan elokuvahaku
    }
}