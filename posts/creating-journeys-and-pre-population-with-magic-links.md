---
title: Creating journeys and pre-population via magic links
---

# Creating journeys and pre-population with magic links

Magic links is a term we can use for links that don't represent an actual page, but instead represent a starting point for our server code to do something before redirecting to an actual page.

## Journey configuration

We can do this with a route handler in our `routes.js` file ([see about setting routes](https://govuk-prototype-kit.herokuapp.com/docs/creating-routes)) and a list of data values to be used for each start link.
	
The route handler will catch the request, update the session data with journey data and then redirect to the first screen on the selected journey. The relevant journey data will now be available throughout the journey.

An example of a journeyData object that has 3 possible journey ids to select, `'1', '2' or '3'`
	
```js

const journeyData = {
  '1': {
    'noNoticeToFile': true
  },
  '2': {
    'noEnrolment': true
  },
  '3': {
    'noEnrolment': true,
    'outstandingPenalties': [
      { amount: 101.48, type: 'Late payment', interestIncluded: 1.48, date: '2021-06-30' },
      { amount: 109.23, type: 'Late filing', interestIncluded: 9.23, date: '2021-03-31' }
    ]
  }
}
```
An example of a magic route handler that you can use in your code, taking care to ensure the `redirect` goes to the first route you would normally go to if you were not starting with a magic link:

```js
router.get('start/:journeyId', (req, res) => {

  const journeyId = req.params.journeyId
  
  if (journeyData.hasOwnProperty(journeyId)) {
    req.session.data = { ...req.session.data, ...journeyData[journeyId] }
  }
  
  // redirect to the first user interaction now we have the journey
  // data available to all routes from here on in
  
  res.redirect('guidance-page')
}
```

The route handler above uses a parameterised uri

```js
router.get('start/:journeyId', (req, res) => { ... }
```

the `:journeyId` part of the route is dynamic meaning whatever comes after the `start/` part of a requested url will be the value of `:journeyId` for example if a link or url requests `start/2` then `:journeyId` will equal `2` - we can access the value of `:journeyId` with the `params` object of the request, for example to get the value of `:journeyId` we can use `req.params.journeyId` like:

```js
  const journeyId = req.params.journeyId
```

In that route handler we extend the session data with the data values from `journeyData` that match the journey id with this bit:

```js
req.session.data = { ...req.session.data, ...journeyData[journeyId] }
```

Using magic links from a prototype index to use this journey data could look like

```html
  <h2>Journey start links</h2>
  <ul>
    <li><a href="guidance-page">No journey data, so not a magic link</a></li>
    <li><a href="start/1">User has no notice to file</a></li>
    <li><a href="start/2">User has no enrolment</a></li>
    <li><a href="start/3">User has no enrolment and outstanding penalties</a></li>
  </ul>
```
	
Whenever a user gets into a journey with journey data configured by a start link, then decisions about when to show different pages on each journey can have values available to make those decisions. Below we configure a route that queries our journeyData after a user submits a page that confirms they are the correct person:
	
```js
router.post('confirm-personal-details', (req, res) => {
  const data = req.session.data
  // user has confirmed they are the correct person
  // so we emulate a check on the back end system
  // to see the state of the user's tax account
  
  if (data.noNoticeToFile) {
    res.redirect('exit-pages/problem-with-account')
  } else if (data.noEnrolment) {
    res.redirect('enter-sa-utr')
  } else {
    res.redirect('account-summary')
  }

}
```

The route handler first checks if `noNoticeToFile` has been set - in this example it means there is a problem with the user's account so we immediately redirect the user to a page that handles there being a problem on the account and no more code is run here. This result would happen to users who clicked on the second link in our Journey start links list which uses journeyId `1`
```html
<a href="start/1">User has no notice to file</a>
```
If `noNoticeToFile` has not been set then the route handler goes on to check if `noEnrolment` has been set, we can see both `journeyData.2` and `journeyData.3` set `noEnrolment` so links to `start/2` or `start/3` will mean `noEnrolment` is set on the session data by our magic link route handler above. Whenever `noEnrolment` is set, in our example it means we need the user to tell us their UTR so we redirect the user to the `enter-sa-utr` page, if that has happened and that form is submitted the following route handler could catch that post:

```js
router.post('enter-sa-utr', (req, res) => {
  const data = req.session.data
  if (data.outstandingPenalties) {
    res.redirect('penalties-are-outstanding')
  } else {
    res.redirect('account-summary')
  }
})
```
and so on...

Hopefully this has helped appreciate the benefits of this strategy for configuring more complex journeys in the prototype kit.
	  
	  
	
	


