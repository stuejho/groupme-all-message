import { getAccessToken, getUserInfo, setGroupDropdown } from './util.js';
import './check-form.js';

async function init() {
  // set nickname attribute in preview (before any API calls) to prevent 
  // "undefined" in preview
  let dropdown = document.getElementById("groups");
  dropdown.options[dropdown.selectedIndex].nickname="Name"

  // Get user access token
  const accessToken = getAccessToken();
  
  // Get user info
  let userInfo = await getUserInfo(accessToken);
  const userId = userInfo.id;
  const userImgUrl = userInfo.image_url;

  // Set image in preview
  if (userImgUrl != null && userImgUrl != "") {
    document.getElementById("user-image").src = userImgUrl;
  }
  
  // Set groups in dropdown
  setGroupDropdown(accessToken, userId);
}

window.onload = init;:
