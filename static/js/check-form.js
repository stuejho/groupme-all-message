function isFormIncomplete() {
  // see if any required form elements are empty
  let someEmpty = false;
  $("*[required]").each(function() {
    if ($(this).val() == null || 
        $(this).val() == ""   ||
        $(this).val() == "@"   ||
        $(this).val() == "none") {
      someEmpty = true;
    }
  });
  return someEmpty;
}

function handleFormModification() {
  // enable/disable button by completion status
  let isIncomplete = isFormIncomplete();
    
  if (isIncomplete) {
    $("#submit").prop('disabled', true);
  } else {
    $("#submit").prop('disabled', false);
  }

  // update group selection
  let dropdown = document.getElementById("groups");
  let selectedGroup = dropdown.options[dropdown.selectedIndex];
  let groupName = selectedGroup.text;

  let groupHeader = document.getElementById("groupname");
  if (groupName !== groupHeader.innerHTML) {
    groupHeader.innerHTML = groupName;
  }

  let groupImage = document.getElementById("group-image");
  if (selectedGroup.group_img_url != null && selectedGroup.group_img_url != "") {
    groupImage.src = selectedGroup.group_img_url;
  }
  else {
    groupImage.src = "https://cdn.groupme.com/assets/avatars/default-group.preview.png?version=1624622267";
  }

  // update user nickname
  let nickname = selectedGroup.nickname;
  let nicknameHeader = document.getElementById("nickname");
  if (nickname !== nicknameHeader.innerHTML) {
    nicknameHeader.innerHTML = nickname;
  }

  // update message preview
  let messageElement = document.getElementById("message-preview-text");
  let prefix = "@" + document.getElementById("handle").value + " ";
  let message = document.getElementById("message").value;
  let newMessage = `<pre><b>${prefix}</b>${message}</pre>`;

  messageElement.innerHTML = newMessage;
}

async function processSubmit() {
  if (submitting) return;

  submitting = true;

  let dropdown = document.getElementById("groups");
  let groupId = dropdown.options[dropdown.selectedIndex].value;
  let prefix = "@" + document.getElementById("handle").value + " ";
  let message = document.getElementById("message").value;
  
  let accessToken = getAccessToken();
  
  // Get list of user ids to mention
  let userIds = await getGroupUserIds(groupId, accessToken);
  
  // Construct mention message
  const guid = "gmgm_" + new Date().getTime();
  let loci = [];
  for (let i = 0; i < userIds.length; ++i) {
    loci.push([0, prefix.length]);
  }
  let requestData = data = {
    "message": {
      "source_guid": guid,
      "text" : prefix + message,
      "attachments" : [
        {
          "type" : "mentions",
          "user_ids" : userIds,
          "loci" : loci
        }
      ]
    }
  };
  
  // Send message
  await sendMessage(groupId, accessToken, requestData);
  
  // Navigate to success page after sending
  window.location.assign("/success");
}

// add change listener when document is ready to check for form completion
$(document).ready(function() {
  // check all elements with the required attribute
  $("*[required]").change(handleFormModification);
  $("*[required]").keyup(handleFormModification);
});

// Prevent duplicate form submissions
$("form").submit(function() {
  $(this).submit(function() {
    return false;
  });
  return true;
});