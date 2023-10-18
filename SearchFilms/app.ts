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
   

    let currentPage = 1; // ������� ��������
    const moviesPerPage = 10; // ���������� ������� �� ��������
    let totalResults = 0; // ����� ���������� �������
    let totalMovies = []; // ������ ������� ��� ������� ��������

    function displayMoviesOnPage(page) {
        const startIndex = (page - 1) * moviesPerPage; // ��������� ��������� ������ �������� � ������� totalMovies
        const endIndex = startIndex + moviesPerPage; // ��������� �������� ������ �������� � ������� totalMovies
        const moviesToDisplay = totalMovies.slice(startIndex, endIndex); //������� ������ � ��������� � �������� �������� ��� ����������� ������� �� ������� ��������

        movieInfo.innerHTML = ''; // ������� ���������� � �������
        moviesToDisplay.forEach((movie, index) => {  // ���������� ������ � ��������
            const movieDiv = document.createElement('div'); // ������� div �� ���� ����������� � ������
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
            movieInfo.appendChild(movieDiv); //��������� ������� movieDiv 
        });

        pageInfo.innerText = `Page ${page}`; // ���������� � ������ ��������
        pagination.style.display = 'block'; // ���������� ��������� ���� ���� ��������� �� �������
    }

    let previousSearch = '';  // ���������� ����������������� -  ��� �������� ���� ������ ������ ���������. ��� ������� ������� totalMovies = [];

    function loadMoviesByPage(page) { //�������� ������� � �������
        const movieTitle = $('#movieTitle').val() as string; // �������� �������� ������ � ����� �������
        const movieType = $('#movieType').val() as string; // �������� ��� � �����

        const apiKey = '56e75dc3'; 

        if (previousSearch !== movieTitleInput.value) { // ���� ���������� ����� �� ����� �������� ������� ������ totalMovies = [];
            
            totalMovies = [];
            previousSearch = movieTitleInput.value;
        }

        const url = `http://www.omdbapi.com/?s=${movieTitle}&type=${movieType}&apikey=${apiKey}&page=${page}`; // ��� ������ � �������

        $.ajax({ 
            type: 'GET',
            url: url,
            success: function (responseData) {
                if (responseData.Response === 'True' && responseData.Search) { //  ���� API ������ ������������� ���������� 
                    const searchResults = responseData.Search; // ��������� Search ���������� searchResults

                    //  ������ ��� ������� ������ ��� ��������� �������������� ������ �� ������ �� ��� ����������� ������ imdbID
                    const movieRequests = searchResults.map(movie => {
                        return $.ajax({
                            type: 'GET',
                            url: `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`,
                        });
                    });

                    // ���������� ���� �������� ��� ��������� �������������� ������
                    $.when(...movieRequests).done(function () { // ������� ���������� ���� ������������ ��������
                        const movieDetails = Array.from(arguments).map(response => response[0]); //��������� � ������ movieDetails �������������� ������ �� ������ 

                        // ���������� ������ � totalMovies
     
                        totalMovies = totalMovies.concat(movieDetails); // ��������� ���������� ������� totalMovies � �������� movieDetails
                        totalResults = parseInt(responseData.totalResults); // ����� ���������� ����������� ������

                        displayMoviesOnPage(currentPage); // ���������� �������� � ��������
                    });
                } else {
                    notFoundMessage.style.display = 'block'; // ���� ����� �� ������ ������������ ��������������� �������
                    pagination.style.display = 'none'; // ��������� �� ������������
                    movieInfo.innerHTML = ''; // ���������� � ������ ���������
                }
            },
            error: function () {
                console.error('������ ������� � API OMDB');
                notFoundMessage.style.display = 'block';
                pagination.style.display = 'none';
                movieInfo.innerHTML = '';
            }
        });
    }

    //�������� ����� ������ �������
    $(movieForm).submit(function (event) {
        event.preventDefault(); // ������ ������������ �������� �������� ��� ������ �� ������

        currentPage = 1; 
        loadMoviesByPage(currentPage);
    });


     // ���������� ������� ���� ���������� �����
    prevPageButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--; // ���������� ������ ��������
            displayMoviesOnPage(currentPage); // ���������� ������ �� ��������
            window.scrollTo(0, 0); // ������� ����� � ������ ��������
        }
    });

    // ���������� ������� ���� ���������� ������
    nextPageButton.addEventListener('click', function () {
        const totalPages = Math.ceil(totalResults / moviesPerPage);
        if (currentPage < totalPages) {
            currentPage++; // ���������� ������ ��������
            loadMoviesByPage(currentPage); // ���������� ������ �� ��������
            window.scrollTo(0, 0); // ������� ����� � ������ ��������
        }
    });

});