import fetchData from './fetchData.js';
import timeFromNow from './timeFromNow.js';
import togglePopup from './togglePopup.js';
import valueRounder from './valueRounder.js';

var requestingArticleName = `/data${window.location.pathname}`;
var reactions = {
	liked: null,
	bookmarked: null,
};

const renderData = (res) => {
	const { success, data } = res;
	console.log(res);
	if (success) {
		const { article, author, user } = data;
		document.title = `ZEERUM \| ${article.title}`;
		document.querySelector(
			'.article-img-container'
		).innerHTML = `<img src="${article.coverImg}"/>`;
		document.querySelector(
			'.article-heading-and-stats-container > .article-heading'
		).innerHTML = `${article.title}`;
		document.querySelector(
			'.article-heading-and-stats-container > .article-stats'
		).innerHTML = `<span class="views"><i class="fas fa-eye"></i> ${valueRounder(
			article.views.allTime
		)} views</span>`;
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
		}" alt="" /><span class="name">${author.firstName} ${author.lastName} ${
			Number(sessionStorage.getItem('userId')) === Number(author.userId) ? '(You)' : ''
		}</span>${
			user !== undefined
				? user.followings.includes(Number(author.userId))
					? `<button class="follow-author-btn follow-author-btn-followed" title="Click to unfollow ${author.firstName}"><i class="fas fa-check"></i> Followed</button>`
					: Number(author.userId) !== Number(sessionStorage.getItem('userId'))
					? `<button class="follow-author-btn"><i class="fas fa-add" title="Click to follow ${author.firstName}"></i> Follow</button>`
					: ''
				: ''
		}`;
		document.querySelector('.author-data-container > img').addEventListener('click', () => {
			document.location = `/user/${author.fullName.toLowerCase()}`;
		});
		document.querySelector('.author-data-container > .name').addEventListener('click', () => {
			document.location = `/user/${author.fullName.toLowerCase()}`;
		});
		if (document.body.contains(document.querySelector('.follow-author-btn'))) {
			document.querySelector('.follow-author-btn').addEventListener('click', () => {
				if (
					document
						.querySelector('.follow-author-btn')
						.classList.contains('follow-author-btn-followed')
				) {
					fetch(`/data/profile?followUser=false&followingUserId=${author.userId}`)
						.then((res) => res.json())
						.then((res) => {
							console.log(res);
							if (res.success) {
								document
									.querySelector('.follow-author-btn')
									.classList.remove('follow-author-btn-followed');
								document.querySelector('.follow-author-btn').innerHTML =
									'<i class="fas fa-add"></i> follow';
								document.querySelector(
									'.follow-author-btn'
								).title = `Click to follow ${author.firstName}`;
							} else alert(res.message);
						});
				} else {
					fetch(`/data/profile?followUser=true&followingUserId=${author.userId}`)
						.then((res) => res.json())
						.then((res) => {
							console.log(res);
							if (res.success) {
								document
									.querySelector('.follow-author-btn')
									.classList.add('follow-author-btn-followed');
								document.querySelector('.follow-author-btn').innerHTML =
									'<i class="fas fa-check"></i> followed';
								document.querySelector(
									'.follow-author-btn'
								).title = `Click to unfollow ${author.firstName}`;
							} else alert(res.message);
						});
				}
			});
		}
		document.querySelector('.reaction-buttons-container > .like > #liked-number').innerHTML =
			valueRounder(article.reactions.likes.length);
		document.querySelector('.reaction-buttons-container > .share > #shared-number').innerHTML =
			valueRounder(article.reactions.shares);
		document.querySelector(
			'.reaction-buttons-container > .bookmark > #bookmarked-number'
		).innerHTML = valueRounder(article.reactions.bookmarks.length);
		if (article.reactions.likes.includes(Number(sessionStorage.getItem('userId')))) {
			reactions.liked = true;
			document.querySelector('.like').classList.add('liked');
		} else reactions.liked = false;

		if (article.reactions.bookmarks.includes(Number(sessionStorage.getItem('userId')))) {
			reactions.bookmarked = true;
			document.querySelector('.bookmark').classList.add('bookmarked');
		} else reactions.bookmarked = false;

		if (article.comments.length !== 0) {
			article.comments.forEach(async (comment, commentId) => {
				await fetchData(`/data/users/${comment.userId}`, ({ success, data }) => {
					if (success) {
						// console.log(comment);
						document.querySelector('#comments').innerHTML =
							`<div class="comment">
								<img src="${data.profilePictureUrl || '/images/user.png'}" 
									onclick="window.location = \`/user/${data.username}\`" />
								<div class="text">
									<a class="name" href="/user/${data.username}">${data.firstName} ${data.lastName} 
										${Number(sessionStorage.getItem('userId')) === comment.userId ? '(YOU)' : ''}
									</a>
									<span class="data">${comment.comment}</span>
									<span class="stats">
										<span class="commented-date" title="Commented on ${new Date(comment.date).toString()}">
											${timeFromNow(comment.date)}
										</span>
										${
											comment.likedUsers.includes(
												Number(sessionStorage.getItem('userId'))
											)
												? `<span class="like-comment liked" data-comment-id="${commentId}">liked</span>`
												: `<span class="like-comment" data-comment-id="${commentId}">like</span>`
										}
										<span class="reply-btn">Reply</span>
									</span>
								</div>
							</div>` + document.querySelector('#comments').innerHTML;
						document.querySelector('.no-comments').style.display = 'none';
					} else {
						document.querySelector('#comments').innerHTML =
							`<div class="comment">
								<img src="/images/user.png" onclick="window.location = \`/user/unknownOrDeletedUser" />
								<div class="text">
									<span class="name">${`Deleted User`}</span>
									<span class="data">${comment.comment}</span>
									<span class="stats">
										<span class="commented-date" title="Commented on ${new Date(comment.date).toString()}">
											${timeFromNow(comment.date)}
										</span>
										<span class="like-comment" data-comment-id="${commentId}">like</span>
										<span class="reply-btn">Reply</span>
									</span>
								</div>
							</div>` + document.querySelector('#comments').innerHTML;
						document.querySelector('.no-comments').style.display = 'none';
					}
				});
				const commentLikeButtons = document.querySelectorAll('.stats > .like-comment');
				commentLikeButtons.forEach((x) => {
					x.addEventListener('click', (e) => {
						if (e.target.classList.contains('liked')) {
							fetchData(
								`${requestingArticleName}?likeComment=false&userId=${sessionStorage.getItem(
									'userId'
								)}&commentId=${e.target.dataset.commentId}`,
								(res) => {
									console.log(res);
									if (res.success) {
										e.target.classList.remove('liked');
										e.target.innerHTML = 'like';
									} else {
										alert(`Error occurred when liking comment . ${res.message}`);
										console.log('Error occurred when liking comment .', res.message);
									}
								},
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
								}
							);
						} else {
							fetchData(
								`${requestingArticleName}?likeComment=true&userId=${sessionStorage.getItem(
									'userId'
								)}&commentId=${e.target.dataset.commentId}`,
								(res) => {
									console.log(res);
									if (res.success) {
										e.target.classList.add('liked');
										e.target.innerHTML = 'liked';
									} else console.log('Error occurred when liking comment .', res.message);
								},
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
								}
							);
						}
					});
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
const comment = document.querySelector('#comment-input-container');
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
		fetch(`${requestingArticleName}?commentOnArticle=true`, {
			method: 'POST',
			body: JSON.stringify({
				userId: sessionStorage.getItem('userId'),
				commentContent: comment.value,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					commentContainer.innerHTML =
						`<div class="comment">
							<img src="${sessionStorage.getItem('userProfilePictureUrl') || '/images/user.png'}" 
								onclick="window.location = \`/user/${sessionStorage.getItem('username')}\`" />
							<div class="text">
								<span class="name">${sessionStorage.getItem('username').replace(/-/gi, ' ')} (you)</span>
								<span class="data">${comment.value}</span>
								<span class="stats">
									<span class="commented-date" title="Commented on ${new Date(comment.date).toString()}">
										${timeFromNow(new Date().getTime())}
									</span>
									<span class="like-comment" data-comment-id="${res.commentId}">like</span>
									<span class="reply-btn">Reply</span>
								</span>
							</div>
						</div>` + commentContainer.innerHTML;
					comment.value = '';
				} else alert(res.message);
			});
	}
}

const reactionsHandler = async (reaction) => {
	if (reaction === 'like') {
		if (!reactions.liked) {
			await fetch(`${requestingArticleName}?likeArticle=true`)
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .like')
							.classList.add('liked');
						document.querySelector('#liked-number').innerHTML++;
						reactions.liked = true;
						console.log(res.message);
					} else alert(res.message);
				});
		} else {
			await fetch(`${requestingArticleName}?likeArticle=false`)
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .like')
							.classList.remove('liked');
						document.querySelector('#liked-number').innerHTML--;
						reactions.liked = false;
						console.log(res.message);
					} else alert(res.message);
				});
		}
	} else if (reaction === 'share') {
		togglePopup(
			`<img src="/images/next.png" alt="Share icon" title="Share this article"/> <h1>Share</h1><p>Share this article with your friends to share the knowledge you gained from this article. This encourages authors to write more as they know they will always have your support for them.</p> <div class="copy-container">${document.location.href}<span class="copy-btn"><i class="far fa-clipboard"></i></span></div> `,
			'share-popup'
		);

		document.querySelector('.copy-btn').addEventListener('click', () => {
			const href = document.location.href;
			const type = 'text/plain';
			console.log(href, typeof href);
			const blob = new Blob([href], { type });
			const data = [new ClipboardItem({ [type]: blob })];
			navigator.clipboard.write(data).then(
				async () => {
					document.querySelector('.copy-container').classList.add('copied');
					document.querySelector(
						'.share-popup'
					).innerHTML += `<p class="copied-message">Copied to the clipboard.</p>`;
					await fetch(`${requestingArticleName}?shareArticle=true`)
						.then((res) => res.json())
						.then((res) => {
							if (res.success) {
								document
									.querySelector('.reaction-buttons-container > .share')
									.classList.add('shared');
								document.querySelector('#shared-number').innerHTML++;
								console.log(res.message);
							}
						});
				},
				(err) => {
					alert('Error occurred in copying data to the clipboard.');
					throw err;
				}
			);
		});
	} else if (reaction === 'bookmark') {
		if (!reactions.bookmarked) {
			await fetch(`${requestingArticleName}?bookmarkArticle=true`)
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .bookmark')
							.classList.add('bookmarked');
						document.querySelector('#bookmarked-number').innerHTML++;
						reactions.bookmarked = true;
						console.log(res.message);
					} else alert(res.message);
				});
		} else {
			await fetch(`${requestingArticleName}?bookmarkArticle=false`)
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .bookmark')
							.classList.remove('bookmarked');
						document.querySelector('#bookmarked-number').innerHTML--;
						reactions.bookmarked = false;
						console.log(res.message);
					} else alert(res.message);
				});
		}
	}
};

function removeNoComments() {
	if (document.querySelector('.comment')) {
		document.querySelector('.no-comments').style.display = 'none';
	}
}
