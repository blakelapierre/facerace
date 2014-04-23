var _ = require('lodash'),
	git = require('git'),
	Repo = git.Repo;

module.exports = function(router, config) {
	new Repo(config.repoLocation, {}, function(err, repo) {
		if (err) console.log(err);

		router.get('/version', function(req, res) {
			repo.head(function(err, head) {
				if (err) console.log(err);
				
				repo.commit(head.commit, function(err, commit) {
					if (err) console.log(err);
					
					res.json({
						id: commit.id,
						sha: commit.sha,
						author: commit.author,
						authored_date: commit.authored_date,
						committer: commit.committer,
						committed_date: commit.committed_date,
						message: commit.message,
						short_message: commit.short_message,
						filechanges: commit.filechanges,
						_id_abbrev: commit._id_abbrev
					});
				});
			});
		});
	});
};