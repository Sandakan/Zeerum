// jshint ignore:start
import fetchData from './fetchData.js';
var requestingArticleName = `/data${window.location.pathname}`;
var reactions = {
	liked: false,
	shared: false,
	bookmarked: false,
};

const renderData = ([article, author]) => {
	// const article = articleData[0];
	// const author = authors[article.author.id];

	document.title = `ZEERUM \| ${article.title}`;
	document.querySelector('.article-img-container').innerHTML = `<img src="${article.coverImg}"/>`;
	document.querySelector(
		'.article-heading-container > .article-heading'
	).innerHTML = `${article.title}`;
	document.querySelector(
		'.article-data-container > .article-data'
	).innerHTML = `${article.article}<div class="end"></div><div class="footnotes">${article.footnotes}</div>`;
	document.querySelector('.author > .author-data-container > img').src = author.profilePicture;
	document.querySelector(
		'.author > .author-data-container > .name'
	).innerHTML = `${author.firstName} ${author.lastName}`;
	document.querySelector('.reaction-buttons-container > .like > #loved-number').innerHTML =
		article.reactions.likes;
	document.querySelector('.reaction-buttons-container > .share > #shared-number').innerHTML =
		article.reactions.shares;
	document.querySelector(
		'.reaction-buttons-container > .bookmark > #bookmarked-number'
	).innerHTML = article.reactions.bookmarks;
	if (article.comments.length !== 0) {
		article.comments.forEach((comment) => {
			document.querySelector('#comments').innerHTML =
				`<div class="comment">${comment.comment}</div>` +
				document.querySelector('#comments').innerHTML;
			document.querySelector('.no-comments').style.display = 'none';
		});
	}
	console.log(author);
};
console.log(requestingArticleName);
requestingArticleName !== '/data/articles/'
	? fetchData(requestingArticleName, renderData)
	: console.log("You didn't request an article");

// ? //////////////////////////////////////////////////////////////////////////////

const commentContainer = document.querySelector('#comments');
const comment = document.querySelector('#add-comment');
const noComments = document.querySelector('.no-comments');

document.querySelector('.comment-send-btn').addEventListener('click', () => {
	sendComment();
	removeNoComments();
});

document.querySelector('.like').addEventListener('click', () => {
	reactionsHandler('like');
});

document.querySelector('.share').addEventListener('click', () => {
	reactionsHandler('share');
});

document.querySelector('.bookmark').addEventListener('click', () => {
	reactionsHandler('bookmark');
});

comment.addEventListener('keyup', function (event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		document.querySelector('.comment-send-btn').click();
	}
});

function sendComment() {
	let date = new Date();
	const currentDate = `${date.getFullYear()}-${
		date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth()
	}-${date.getDate() > 9 ? date.getDate() : '0' + date.getDate()}`;
	const currentTime = `${date.getHours() > 12 ? '0' + (date.getHours() - 12) : date.getHours()}:${
		date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes
	}:${date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds()} ${
		date.getHours() > 12 ? 'PM' : 'AM'
	}`;
	if (comment.value !== '' && /\S/gi.test(comment.value)) {
		commentContainer.innerHTML =
			`<div class="comment">${comment.value}<span class="date">By you on ${currentDate} at ${currentTime}</span></div>` +
			commentContainer.innerHTML;
		comment.value = '';
	}
}

function reactionsCount(id) {
	var used = false;
	if (used) {
		used = false;
		document.querySelector('#loved-number').innerHTML--;
	} else {
		used = true;
		document.querySelector('#loved-number').innerHTML++;
	}
}

const reactionsHandler = (reaction) => {
	if (reaction === 'like') {
		if (!reactions.liked) {
			document.querySelector('#loved-number').innerHTML++;
			reactions.liked = true;
		} else {
			document.querySelector('#loved-number').innerHTML--;
			reactions.liked = false;
		}
	} else if (reaction === 'share') {
		if (!reactions.shared) {
			document.querySelector('#shared-number').innerHTML++;
			reactions.shared = true;
		} else {
			document.querySelector('#shared-number').innerHTML--;
			reactions.shared = false;
		}
	} else if (reaction === 'bookmark') {
		if (!reactions.bookmarked) {
			document.querySelector('#bookmarked-number').innerHTML++;
			reactions.bookmarked = true;
		} else {
			document.querySelector('#bookmarked-number').innerHTML--;
			reactions.bookmarked = false;
		}
	}
};

function removeNoComments() {
	if (document.querySelector('.comment')) {
		document.querySelector('.no-comments').style.display = 'none';
	}
}
