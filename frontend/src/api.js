const API_BASE = 'https://comp426.peterandringa.com';

export async function checkLogin(jwt){
  return fetch(API_BASE+'/account/status', {
    method: 'GET',
    headers: { "Authorization": "Bearer "+jwt }
  }).then(res => res.json());
}

export async function userExists(name){
  const res = await fetch(API_BASE+'/account/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ name, pass: '_' })
  }).then(res => res.json());

  return res.msg.indexOf('is not a registered user') == -1;
}

export function loginUser(name, pass) {
  console.log('attempting to log in', name, pass);
  return fetch(API_BASE+'/account/login', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({ name, pass })
  }).then(res => res.json());
}

export function createUser(name, pass) {
  console.log('attempting to create', name, pass)
  return fetch(API_BASE+'/account/create', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({ 
      name, pass,
      data: {
        'favorites': {}
      } 
    })
  }).then(res => res.json());
}

export async function createAndLogin(name, pass){
  const created = await createUser(name, pass);
  if(!created || !created.status || created.status.toLowerCase().indexOf('success') == -1){
    return created; // error occured
  }
  return loginUser(name, pass);
}

// Based on https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
export function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
export function eraseCookie(name) {
  window._FAVORITES = new Set();
  document.cookie = name+'=; Max-Age=-99999999;';  
};

export function addFavorite(stop_id){
  window._FAVORITES.add(stop_id);
  console.log('new ', window._FAVORITES);
  return fetch(API_BASE+'/user/favorites/'+stop_id, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Bearer "+getCookie('jwt')
    },
    body: JSON.stringify({
      data: {
        chosen: true 
      },
      type: "merge"
    })
  }).then(d => d.json());
}

export function removeFavorite(stop_id){
  window._FAVORITES.delete(stop_id);

  return fetch(API_BASE+'/user/favorites/'+stop_id, {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Bearer "+getCookie('jwt')
    }
  }).then(d => d.json());
}

export function getFavorites(){
  return fetch(API_BASE+'/user/favorites', {
    method: 'GET',
    headers: { "Authorization": "Bearer "+getCookie('jwt') }
  })
  .then(d => d.json())
  .then(d => {
    if(!d || !d.result) return window._FAVORITES = new Set();
    const res = Object.keys(d.result);
    return window._FAVORITES = new Set(res);;
  });
}
getFavorites().then(d => console.log(d));

export default {
  userExists, checkLogin,
  loginUser, createUser, createAndLogin,
  setCookie, getCookie, eraseCookie,
  addFavorite, removeFavorite, getFavorites
};