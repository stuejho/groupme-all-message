/*
 * Constants
 */
const BASE_URL = "https://api.groupme.com/v3";
const ME_URL = BASE_URL + "/users/me";
const GROUPS_URL = BASE_URL + "/groups";
const MAX_PER_PAGE = 15;

function readCookie(key) {
	const tokens = document.cookie.split(';');

  const NAME = 0;
  const VALUE = 1;

  for (let i = 0; i < tokens.length; ++i) {
    let pair = tokens[i].split("=");
    if (pair[NAME] === key) return pair[VALUE];
  }
	return null;
}


/**
 * Returns the user's access token.
 * 
 * @return {string}   User access token
 */
function getAccessToken() {
  return readCookie("access_token");
}

/**
 * Performs a GET request to return a Promise representing the user's GroupMe 
 * information. The request requires the user's GroupMe access token.
 *
 * @param {string}    accessToken - User GroupMe access token
 * @return {Promise<Object>}  Promise object representing user information
 */
 function getUserInfo(accessToken) {
  // Send GET request to get groups
  const REQUEST_URL = `${ME_URL}?token=${accessToken}`;
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: REQUEST_URL,
      type: "GET",
      success: function(result) {
        resolve(result.response);
      },
      error: function (xhr, exception) {
        console.log(xhr);
        console.log(exception);
        alert("Error getting user id.");
        reject("Error getting user id.");
      }
    });
  });
}

/**
 * Performs a GET request to return a Promise representing the user's groups. 
 * The requrest requires the user's GroupMe access token.
 *
 * @param {string}    accessToken - User GroupMe access token
 * @param {number}    perPage - Number of groups to return
 * @param {number}    page - Page to return (starting from 1)
 * @return {Promise<Object[]>}  Promise object representing an array of the user's groups
 */
function getGroups(accessToken, perPage, page) {
  // Send GET request to get groups
  const REQUEST_URL = `${GROUPS_URL}?token=${accessToken}&per_page=${perPage}&page=${page}`;
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: REQUEST_URL,
      type: "GET",
      success: function(result) {
        const response = result.response;
        resolve(response);
      },
      error: function (xhr, exception) {
        console.log(xhr);
        console.log(exception);
        alert("Error getting groups.");
        reject("Error getting groups.");
      }
    });
  });
}

/**
 * Performs a GET request to return a Promise representing a group's user IDs.
 * The request requires the group Id and the user's GroupMe access token.
 *
 * @param {string}    groupId - Group ID number
 * @param {string}    accessToken - User GroupMe access token
 * @return {Promise<Object[]>}  Promise object representing an array of user IDs
 */
function getGroupUserIds(groupId, accessToken) {
  // Send GET request to get groups
  const REQUEST_URL = `${GROUPS_URL}/${groupId}?token=${accessToken}`;
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: REQUEST_URL,
      type: "GET",
      success: function(result) {
        const members = result.response.members;
        resolve(members.map(m => m.user_id));
      },
      error: function (xhr, exception) {
        console.log(xhr);
        console.log(exception);
        alert("Error getting target group users.");
        reject("Error getting target group users.");
      }
    });
  });
}

/**
 * Performs a POST request to send a @group message and returns a Promise 
 * representing the request response.
 *
 * @param {string}    groupId - Group ID number
 * @param {string}    accessToken - User GroupMe access token
 * @param {Object}    messageData - Data representing message to send
 * @return {Promise<Object[]>}  Promise object representing an array of user IDs
 */
function sendMessage(groupId, accessToken, messageData) {
  const REQUEST_URL = `${GROUPS_URL}/${groupId}/messages?token=${accessToken}`;
  return new Promise((resolve, reject) => {
    $.ajax({
      url: REQUEST_URL,
      type: "POST",
      contentType: "application/json;charset=utf-8",
      dataType: "json",
      data: JSON.stringify(messageData), // stringify to prevent encoding errors
      success: function(result) {
        resolve(result);
      },
      error: function (xhr, exception) {
        console.log(xhr);
        console.log(exception);
        alert("Error sending message.");
        reject("Error sending message.");
      }
    });
  });
}

/**
 * Asynchronous function setting the message page's group dropdown list. This 
 * function requires the user access token to get the user's groups. Also, the
 * user ID is required to determine whether a user is an admin or owner of a 
 * group.
 *
 * @param {string}    accessToken - User GroupMe access token
 * @param {string}    userId - User GroupMe ID
 */
async function setGroupDropdown(accessToken, userId) {
  // Send GET request to get first page
  let page = 1;
  let groups = await getGroups(accessToken, MAX_PER_PAGE, page);
  ++page;
  
  let dropdown = document.getElementById("groups");
  dropdown.options[dropdown.selectedIndex].nickname="Name"
  addToDropdown(dropdown, groups, userId);
  
  // Change text to reflect completion of loading
  dropdown.options[dropdown.selectedIndex].text = "Select a group";
  
  // Get subsequent pages until GET request returns 0 elements
  while (true) {
    groups = await getGroups(accessToken, MAX_PER_PAGE, page);
    addToDropdown(dropdown, groups, userId);
    if (groups.length === 0) break;
    ++page;
  }
}

/**
 * Adds groups to a dropdown list if the user is a admin/owner.
 *
 * @param {Object}    dropdown - Object representing a select element
 * @param {Object[]}  groupList - Array of user groups in JSON format
 * @param {string}    userId - User GroupMe ID
 */
function addToDropdown(dropdown, groupList, userId) {
  groupList.forEach(group => {
    const { isAdminOrOwner, userIndex } = userIsAdminOrOwner(group.members, userId);
    /*if (group.name === "Personal Message") {
      addGroupOptionToDropdown(dropdown, group, userIndex);
    }*/
    if (isAdminOrOwner) {
      addGroupOptionToDropdown(dropdown, group, userIndex);
    }
  });
}

/**
 * Adds a group to a dropdown list. A new option element is created with the  
 * text set to the group name and value set to the group ID. Also, the user's
 * nickname is assigned to an attribute of the option called `nickname`.
 *
 * @param {Object}    dropdown - Object representing a select element
 * @param {Object}    group - Group in JSON format
 * @param {string}    userIndex - User index in members array
 */
function addGroupOptionToDropdown(dropdown, group, userIndex) {
  let option = document.createElement("option");
  option.text = group.name;
  option.value = group.id;
  option.nickname = group.members[userIndex].nickname;
  option.group_img_url = group.image_url;
  dropdown.add(option);
}

/**
 * Checks to see if a user is an admin or owner of a group given the group's
 * membership.
 *
 * @param {Object[]}  membersList - Array of group members in JSON format
 * @param {string}    groupId - User GroupMe ID
 * @return {Object}   Returns a JSON object representing the user admin/owner 
 *                    status and user position in the members array
 */
function userIsAdminOrOwner(membersList, userId) {
  let i = 0;
  while (i < membersList.length) {
    if (membersList[i].user_id === userId) {
      if (membersList[i].roles.includes("admin") || 
          membersList[i].roles.includes("owner")) {
        return { isAdminOrOwner: true, userIndex: i };
      }
      else {
        return { isAdminOrOwner: false, userIndex: i };
      }
    }
    ++i;
  }
  return { isAdminOrOwner: false, userIndex: i };
}

export { getAccessToken, getUserInfo, getGroups, getGroupUserIds, sendMessage, 
  setGroupDropdown, userIsAdminOrOwner };