import fetchData from './fetchData.js';
import timeFromNow from './timeFromNow.js';
var requestingArticleName = `/data${window.location.pathname}`;
var reactions = {
	liked: false,
	shared: false,
	bookmarked: false,
};

const renderData = (res) => {
	const { success, data } = res;
	console.log(res);
	if (success) {
		const { article, author } = data;
		document.title = `ZEERUM \| ${article.title}`;
		document.querySelector(
			'.article-img-container'
		).innerHTML = `<img src="${article.coverImg}"/>`;
		document.querySelector(
			'.article-heading-container > .article-heading'
		).innerHTML = `${article.title}`;
		document.querySelector('.article-data-container > .article-data').innerHTML = `${
			article.article
		}<div class="end"></div><div class="footnotes">${
			article.footnotes
		}</div><div class="tags">${article.tags
			.map((x) => {
				return `<a href="/tags/${x.toLowerCase()}"><span class="tag">#${x}</span></a>`;
			})
			.join('')}</div>`;
		document.querySelector('.author > .author-data-container').innerHTML = `<img src="${
			author.profilePictureUrl || '/images/user.png'
		}" alt="" /><span class="name">${author.firstName} ${author.lastName}</span>`;
		document.querySelector('.author-data-container > img').addEventListener('click', () => {
			document.location = `/user/${author.fullName.toLowerCase()}`;
		});
		document.querySelector('.author-data-container > .name').addEventListener('click', () => {
			document.location = `/user/${author.fullName.toLowerCase()}`;
		});
		document.querySelector('.reaction-buttons-container > .like > #loved-number').innerHTML =
			article.reactions.likes.length;
		document.querySelector('.reaction-buttons-container > .share > #shared-number').innerHTML =
			article.reactions.shares.length;
		document.querySelector(
			'.reaction-buttons-container > .bookmark > #bookmarked-number'
		).innerHTML = article.reactions.bookmarks.length;
		if (article.comments.length !== 0) {
			article.comments.forEach((comment) => {
				fetchData(`/data/users/${comment.userId}`, ({ success, data }) => {
					if (success) {
						document.querySelector('#comments').innerHTML =
							`<div class="comment"><img src="${
								data.profilePictureUrl || '/images/user.png'
							}" onclick="window.location = \`/user/${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}\`" /><div class="text">${
								comment.comment
							}<span class="commented-date">${timeFromNow(
								comment.date
							)}</span></div></div>` + document.querySelector('#comments').innerHTML;
						document.querySelector('.no-comments').style.display = 'none';
					} else {
						document.querySelector('#comments').innerHTML =
							`<div class="comment"><img src="/images/user.png" onclick="window.location = \`/user/unknownOrDeletedUser" /><div class="text">${comment.comment}<span class="commented-date">${comment.date}</span></div></div>` +
							document.querySelector('#comments').innerHTML;
						document.querySelector('.no-comments').style.display = 'none';
					}
				});
			});
		}
	} else console.log(`Error occurred when requesting article data. ${res.message}`);
};
console.log(requestingArticleName);
if (requestingArticleName !== '/data/articles/') fetchData(requestingArticleName, renderData);
else console.log("You didn't request an article");

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
	if (comment.value !== '' && /\S/gi.test(comment.value)) {
		commentContainer.innerHTML =
			`<div class="comment"><img src="${sessionStorage.getItem(
				'userProfilePictureUrl'
			)}" onclick="window.location = \`/user/${sessionStorage.getItem(
				'username'
			)}\`" /><div class="text">${comment.value}<span class="commented-date">${timeFromNow(
				new Date().getTime()
			)}</span></div></div>` + commentContainer.innerHTML;
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
