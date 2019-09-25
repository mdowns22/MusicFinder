'use strict';

//Api keys and urls
const youTubeApiKey = 'AIzaSyD3ktdkxK-ywwtz_WVXydUCuN7bqQTP-Eg';
const ticketMasterApiKey = 'ff53iBiixVGbGEMApy6TagT9H3MTbGJQ';
const youTubeUrl = 'https://www.googleapis.com/youtube/v3/search';
const ticketMasterUrl = 'https://app.ticketmaster.com/discovery/v2/events';
const tmArtistUrl = 'https://app.ticketmaster.com/discovery/v2/attractions';



function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&').replace(/%2C/g, ",");
}


function displayVideoResults(responseJson) {
 // console.log(responseJson);
  for (let i = 0; i < responseJson.items.length; i++) {
   let title = responseJson.items[i].snippet.title;
   //let description = responseJson.items[i].snippet.description;
   let videoId = responseJson.items[i].id.videoId;
  //console.log(title);
 // console.log(description);
  //console.log(videoId);
     $('.videos').append(
      `<div class="videoResults">
      <h5 class="videoTitle">${title}</h5>
      <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank"><img class="videoImg" src='${responseJson.items[i].snippet.thumbnails.default.url}'></a>
        </div>`
      //<p>${description}</p>
      
      ).show()}; 
};

function displayEventResults(responseJson) {
  console.log('***displayEventsResults***',responseJson);
       let pageResult = responseJson.page.totalElements;
      console.log('***number of items***',pageResult);
      // Conditional Statement for artists without scheduled events
      if(pageResult < 1){
        console.log('No events!');
        $('.events').append(`<div class="eventResults">
            <h1>No Scheduled Events</h1>
          </div>`).show();
      } 

    for (let i = 0; i < responseJson._embedded.events.length; i++) {
      console.log('i=',i,'responseJson.length',responseJson._embedded.events.length);
      console.log('***event response***', responseJson._embedded.events);
      let name = responseJson._embedded.events[i].name;
      //console.log('event', name);
      let localDate = responseJson._embedded.events[i].dates.start.localDate;
      //console.log('event', localDate);
      let localTime = responseJson._embedded.events[i].dates.start.localTime;
      //console.log('event', localTime);
      let tickets = responseJson._embedded.events[i].url;
      //console.log('event', tickets);
      let venueString = "";

      //loop for venues
      console.log('***made it to venues***');
      for(let j = 0; j < responseJson._embedded.events[i]._embedded.venues.length; j++) {
        console.log(responseJson._embedded.events[i]._embedded.venues[j]);
      let venueName = responseJson._embedded.events[i]._embedded.venues[j].name;
      //console.log('***venue***', name);
      let address1 = responseJson._embedded.events[i]._embedded.venues[j].address.line1;
      //console.log('***venue***', address1);
      let cityName = responseJson._embedded.events[i]._embedded.venues[j].city.name;
      //console.log('***venue***', cityName);
      let stateCode = responseJson._embedded.events[i]._embedded.venues[j].state.stateCode;
      //console.log('***venue***', stateCode);
       venueString = `<p> Venue: ${venueName}</p><p>${address1}</p><p>${cityName},${stateCode}</p>`;
      console.log(venueString);
      };
    
      //let id = responseJson._embedded.events[i].id;
     // console.log(responseJson._embedded.events);
      console.log('***getting ready to append***');
     $('.events').append(
        `<div class="eventResults">
            <h3>${name}</h3>
            <p>Date: ${localDate}</p>
            <p>Start Time: ${localTime}</p>
           ${venueString}
            <a href=${tickets} target="_blank"><button class="ticketButton" type="button">See Tickets</button></a>
          </div>`
    ).show()};
    console.log('appended');
};

/* function displayArtistResult(responseJson) {
  console.log(responseJson);
  let artistResult = responseJson._embedded.attractions[0].id;
  console.log(artistResult);
} */


//This functions returns the searched artist youtube page
function getVideos(searchTerm, maxResults=5) {
  const params = {
    key: youTubeApiKey,
    q: searchTerm +'VEVO',
    part: 'snippet,id',
    maxResults,
    type: 'video' 
  };
  const queryString = formatQueryParams(params);
  const videoUrl = youTubeUrl + '?' + queryString;

  console.log('***youtubeUrl***',videoUrl);

  fetch(videoUrl)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => displayVideoResults(responseJson))
  .catch(err => {
    $('js-error-message').text(`Something went wrong: ${err.message}`);
  });
}

//This function grab the events of the searched artist
function getEvents(searchTerm, artistResult, page=0, size=5 ) {
  const params = {
    apikey: ticketMasterApiKey,
    keyword: searchTerm,
    attractionId: artistResult,
    countryCode: 'US',
    sort: 'date,asc',
    page,
    size
  };
  const queryString = formatQueryParams(params);
  const eventUrl = ticketMasterUrl + '?' + queryString;
  console.log('***incoming data***',searchTerm, artistResult);

  console.log('***eventUrl***',eventUrl);
  fetch(eventUrl)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => displayEventResults(responseJson))
  .catch(err => {
    $('js-error-message').text(`Something went wrong: ${err.message}`);
  }); 

}

//This function will get the ticketmaster id for searched artist to help filter the results returned.
function getArtists(searchTerm, size=1) {
  const params = {
  apikey: ticketMasterApiKey,
  keyword: searchTerm,
  size,
  sort: 'relevance,desc'
  };
  const queryString = formatQueryParams(params);
  const artistUrl = tmArtistUrl + '?' + queryString;

  console.log('***artistUrl***',artistUrl);

  fetch(artistUrl)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => getEvents(searchTerm, responseJson._embedded.attractions[0].id))
  .catch(err => {
    $('js-error-message').text(`Something went wrong: ${err.message}`);
  });
}


function submitForm() {
  $('#js-form').submit(event => {
  $('.videoResults').empty();
  $('.eventResults').empty();
  //$('.container').empty();
    event.preventDefault();
    let searchTerm = $('#js-artist-search').val();
    console.log('***userInput***',searchTerm);
    getArtists(searchTerm);
    //getEvents(searchTerm);
    getVideos(searchTerm);
  });

}

$(submitForm);