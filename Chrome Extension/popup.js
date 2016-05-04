// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function GetHTMLOfBookmarks() {
  
  var bookmarkHTML = "<ul>";
      
  var AddBookmarksToHTML = function(bookmarkTreeNode) {
    if (typeof bookmarkTreeNode.url !== 'undefined') //If it's a file
    {
      bookmarkHTML += "<li><a href='" + bookmarkTreeNode.url + "'>" + bookmarkTreeNode.title +"</a></li>";
    }
    else {//if i's a folder
      bookmarkHTML += "<li><span>" + bookmarkTreeNode.title +"</span>";
      bookmarkHTML += "<ul>"; 
      bookmarkTreeNode.children.forEach(function(item) {
        AddBookmarksToHTML(item);
      });
      bookmarkHTML += "</ul></li>";
    }
        
  };

  chrome.bookmarks.getTree(function(itemTree){
  
    itemTree.forEach(function(item) {
      AddBookmarksToHTML(item);
    });
  });
  
  bookmarkHTML += "</ul>";
  
  return bookmarkHTML;
}


function AddDriveItemAndChildrenToBookmarkFolder(driveItem, bookmarkFolder) {
  if (typeof driveItem.url === "undefined") { //If the drive path is a folder
    chrome.bookmarks.create({'parentId' : bookmarkFolder.id, 'title' : driveItem.title}, function(NewDriveFolder) {
      driveItem.children.forEach(function(item){
        AddDriveItemAndChildrenToBookmarkFolder(item, NewDriveFolder);
      });
    });
  }
  else //If drive path is a file
    chrome.bookmarks.create({'parentId' : bookmarkFolder.id, 'title' : driveItem.title, 'url' : driveItem.url });
}



function LoadDriveContentsToBookmarks() {
  var DriveBookmarkFolder;
  
  var rootDrivePath = drivePaths[0];
  
  console.log(rootDrivePath.title);
  
  chrome.bookmarks.search({"title" : rootDrivePath.title}, function(DriveBookmarkFolders) { 
    if (DriveBookmarkFolders.length === 0) { //If this folder hasn't been created yet
      
      chrome.bookmarks.create({'parentId': '1', 'title': rootDrivePath.title}, function(NewDriveBookmarkFolder) { 
        rootDrivePath.children.forEach(function(item) {
          AddDriveItemAndChildrenToBookmarkFolder(item, NewDriveBookmarkFolder);
        });
      });
    }
    else 
    {
      chrome.bookmarks.getChildren(DriveBookmarkFolders[0].id, function(children) { //If the folder exists, remove all its children
        children.forEach(function(item) { 
          chrome.bookmarks.removeTree(item.id);
        });
      });
      
      for (var num in rootDrivePath.children) {
        AddDriveItemAndChildrenToBookmarkFolder(rootDrivePath.children[num], DriveBookmarkFolders[0]);
      }
    }
  });
  
}

