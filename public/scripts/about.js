// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const testimonialData = [
	{
		name: 'Roberta Koepp',
		comment:
			'Expedita deleniti fugiat rerum animi illum placeat. Officiis debitis itaque voluptas harum est ratione excepturi. Tenetur reprehenderit reiciendis fuga ratione cupiditate.',
	},
	{
		name: 'Wade Gleichner',
		comment:
			'Error accusamus magni ut ab ipsa. Sunt nam quis eius consequatur. Eveniet velit qui quidem ipsum sint. Corporis vitae voluptatem commodi. Earum sint quia velit voluptatum. Ut animi nihil.',
	},
	{
		name: 'Tyrone Swaniawski',
		comment:
			'Et optio enim officia in. Libero illo temporibus quibusdam. Asperiores dolor suscipit molestiae quas saepe. Alias voluptas sed tempora sint natus error. Assumenda cumque ut molestiae.',
	},
	{
		name: 'Maggie Wehner',
		comment:
			'Eos veniam ab reprehenderit consequatur ut inventore. Inventore officia veritatis aut quis. Omnis odio sint ea voluptatibus. Et consequatur animi sit corrupti quae quisquam repellat illo.',
	},
];

const users = document.querySelectorAll('.users-container > img');
let currentHighlightUserImg = 0;

const changeCurrentHighlightedUserImgNumber = (forceChangeImg = null) => {
	if (forceChangeImg !== null) {
		currentHighlightUserImg = forceChangeImg;
		changeCurrentHighlightUserImg();
	} else {
		if (currentHighlightUserImg === testimonialData.length - 1) {
			currentHighlightUserImg = 0;
			changeCurrentHighlightUserImg();
		} else {
			currentHighlightUserImg++;
			changeCurrentHighlightUserImg();
		}
	}
};

const changeCurrentHighlightUserImg = () => {
	const userData = testimonialData[currentHighlightUserImg];
	users.forEach((x) => x.classList.remove('active'));
	users[currentHighlightUserImg].classList.add('active');
	document.querySelector(
		'.user-comment-container'
	).innerHTML = `${userData.comment}<div class="comment-user-name">${userData.name}</div>`;
};

users.forEach((user) => {
	user.addEventListener('mouseover', (e) =>
		changeCurrentHighlightedUserImgNumber(e.target.dataset.userId)
	);
});

setInterval(() => changeCurrentHighlightedUserImgNumber(), 4000);
