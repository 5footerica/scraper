/*
Web scraper challenge
03/13/18
Erica Weems, Tempe
Utilizes casperjs
Full disclosure: I have never written a web scraper,
I spent a lot of time wokring through various tutorials,
deciding what tools/libs to use, reading official docs
and searching a lot on StackOverflow. I first tried using
Python + BeautifulSoup, but found that it was insufficient
because of the dynamic data for doctors info.
However, these are the real world skills I would love to be learning
Sources:
/http://docs.casperjs.org/en/1.1-beta2/quickstart.html
https://stackoverflow.com/questions/41186171/casper-js-links-from-array
http://docs.casperjs.org/en/latest/modules/casper.html?highlight=click
*/
var casper = require('casper').create();

console.log('hello world!');
casper.start('https://healthy.kaiserpermanente.org/northern-california/doctors-locations#/search-form');
console.log('started');

// waits for page to load and finds search and city drop down selectors
casper.waitForSelector('search-dropdown#cityDropdownLi', function() {
    this.echo("page ready!");
}, null, 3000);

// waits for 3 seconds
casper.wait(3000);

// fills city drop down search with "Redwood City"
/* used this source for help:
http://docs.casperjs.org/en/latest/modules/casper.html?highlight=click
*/
casper.then(function(){
  this.fillSelectors('search-dropdown#cityDropdownLi', {
      'select#city-dropdown-li':  "Redwood City"
  });
});

// clicks search button with our search term
casper.thenClick('#searchButton', function(){
  console.log('I clicked!');
})

// waits for page to load
casper.waitForSelector('search-result-doctor > div', function() {
    this.echo("I have results?");
}, null, 30000);

// finds div with doctor info, returns name, specialty, etc
function getDoctors() {
  var doctors = document.querySelectorAll('div.detail-data');
/* used source for help:
 https://stackoverflow.com/questions/41186171/casper-js-links-from-array
*/
  return Array.prototype.map.call(doctors, function(e) {
    return {
      name: e.querySelector('.doctorTitle').text,
      specialty: e.querySelector('.specialtyMargin').textContent,
      office: e.querySelector('.doctorOffice > span').textContent,
      address: e.querySelector('.doctorAddress > span').textContent,
      city: e.querySelector('.doctorAddress > div :nth-child(1)').textContent,
      state: e.querySelector('.doctorAddress > div :nth-child(2)').textContent,
      zip: e.querySelector('.doctorAddress > div :nth-child(3)').textContent,
    }
  });
}

// repeat a few more times to get >50 doctors
casper.repeat(3, function() {

  this.waitForSelector('search-result-doctor > div', function() {
    this.echo("I have results?");
  }, null, 30000);

  this.then(function() {
    const doctors = this.evaluate(getDoctors);
    this.echo(JSON.stringify(doctors,null,2));
  });

/* clicks last child pagination link, using just '.pagination'
didn't give desired results, populated dup data
*/
  this.thenClick('.pagination :last-child > a', function(){
    this.echo('next!');
  })
});

casper.run();
