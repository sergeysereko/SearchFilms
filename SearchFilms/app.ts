/// <reference path="Scripts/typings/jquery/jquery.d.ts"/>

document.addEventListener('DOMContentLoaded', function () {
    const movieForm = document.getElementById('movieForm') as HTMLFormElement;
    const movieTitleInput = document.getElementById('movieTitle') as HTMLInputElement;
    const movieTypeSelect = document.getElementById('movieType') as HTMLSelectElement;
    const movieInfo = document.getElementById('movieInfo');
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const notFoundMessage = document.getElementById('notFoundMessage');
   

    let currentPage = 1; // текущая страница
    const moviesPerPage = 10; // количество фильмов на странице
    let totalResults = 0; // общее количество фильмов
    let totalMovies = []; // массив фильмов для текущей страницы

    function displayMoviesOnPage(page) {
        const startIndex = (page - 1) * moviesPerPage; // вычисляем начальный индекс элемента в массиве totalMovies
        const endIndex = startIndex + moviesPerPage; // вычисляем конечный индекс элемента в массиве totalMovies
        const moviesToDisplay = totalMovies.slice(startIndex, endIndex); //создаем массив с начальным и конечным индексом для отображения фильмов на текущей странице

        movieInfo.innerHTML = ''; // очищаем информациб о фильмах
        moviesToDisplay.forEach((movie, index) => {  // перебираем масиив с фильмами
            const movieDiv = document.createElement('div'); // создаем div со всей информацией о фильме
            movieDiv.className = 'movie-item';
            movieDiv.innerHTML = `
            <div class="movie-item">
                 <div class="movie-poster">
                   <img src="${movie.Poster}" alt="Movie Poster" class="img">
                 </div>
                 <div class="movie-details">
                     <h2>${movie.Title}</h2>
                    <p>Type: ${movie.Type}</p>
                    <p>Year: ${movie.Year}</p>
                    <p>Release: ${movie.Release}</p>
                    <p>Genre: ${movie.Genre}</p>
                    <p>Country: ${movie.Country}</p>
                    <p>Director: ${movie.Director}</p>
                    <p>Writer: ${movie.Writer}</p>
                    <p>Actors: ${movie.Actors}</p>
                 </div>
            </div> 
            `;
            movieInfo.appendChild(movieDiv); //добавляем элемент movieDiv 
        });

        pageInfo.innerText = `Page ${page}`; // информация о номере страницы
        pagination.style.display = 'block'; // отображаем пагинацию если есть результат от сервера
    }

    let previousSearch = '';  // переменная предыдущегопоиска -  для проверки если запрос поиска изменился. Для очистки масиива totalMovies = [];

    function loadMoviesByPage(page) { //загрузка фильмов с сервера
        const movieTitle = $('#movieTitle').val() as string; // получаем назвнаие фильма с формы запроса
        const movieType = $('#movieType').val() as string; // получаем тип с формы

        const apiKey = '56e75dc3'; 

        if (previousSearch !== movieTitleInput.value) { // если предыдущий поиск не равен текущему очищаем масиив totalMovies = [];
            
            totalMovies = [];
            previousSearch = movieTitleInput.value;
        }

        const url = `http://www.omdbapi.com/?s=${movieTitle}&type=${movieType}&apikey=${apiKey}&page=${page}`; // АПИ запрос к серверу

        $.ajax({ 
            type: 'GET',
            url: url,
            success: function (responseData) {
                if (responseData.Response === 'True' && responseData.Search) { //  если API вернул положительные результаты 
                    const searchResults = responseData.Search; // присаваем Search переменной searchResults

                    //  запрос для каждого фильма для получения дополнительных данных по фильму по его уникальному номеру imdbID
                    const movieRequests = searchResults.map(movie => {
                        return $.ajax({
                            type: 'GET',
                            url: `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`,
                        });
                    });

                    // Выполнение всех запросов для получения дополнительных данных
                    $.when(...movieRequests).done(function () { // ожидаем выполнение всех ассинхронных запросов
                        const movieDetails = Array.from(arguments).map(response => response[0]); //добавляем в массив movieDetails дополнительные данные по фильму 

                        // Обновление данных в totalMovies
     
                        totalMovies = totalMovies.concat(movieDetails); // объединяю информацию массива totalMovies с массивом movieDetails
                        totalResults = parseInt(responseData.totalResults); // общее количество результатов поиска

                        displayMoviesOnPage(currentPage); // обновление страницы с фильмами
                    });
                } else {
                    notFoundMessage.style.display = 'block'; // если фильм не найден отображается соответствующая надпись
                    pagination.style.display = 'none'; // пагинация не отображается
                    movieInfo.innerHTML = ''; // информация о фильме очищается
                }
            },
            error: function () {
                console.error('Ошибка запроса к API OMDB');
                notFoundMessage.style.display = 'block';
                pagination.style.display = 'none';
                movieInfo.innerHTML = '';
            }
        });
    }

    //отправка формы поиска фильмов
    $(movieForm).submit(function (event) {
        event.preventDefault(); // отмена стандартного действие браузера при клинке по сабмит

        currentPage = 1; 
        loadMoviesByPage(currentPage);
    });


     // отбражение страниы если клиникнули назад
    prevPageButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--; // уменьшение номера страницы
            displayMoviesOnPage(currentPage); // отображаем фильмы на странице
            window.scrollTo(0, 0); // скролим вверх в начало страницы
        }
    });

    // отбражение страниы если клиникнули вперед
    nextPageButton.addEventListener('click', function () {
        const totalPages = Math.ceil(totalResults / moviesPerPage);
        if (currentPage < totalPages) {
            currentPage++; // увеличение номера страницы
            loadMoviesByPage(currentPage); // отображаем фильмы на странице
            window.scrollTo(0, 0); // скролим вверх в начало страницы
        }
    });

});