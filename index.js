const express = require('express');
const fs = require('fs');
const marked = require('marked');
const ejs = require('ejs');

const app = express();
const PORT = 3000;
const POSTS_PER_PAGE = 5;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('style'));

function generatePostsData(page) {
    const postsDir = './posts';
    const postFiles = fs.readdirSync(postsDir);

    // 过滤掉.DS_Store文件
    const filteredFiles = postFiles.filter((file) => file !== '.DS_Store');

    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = page * POSTS_PER_PAGE;

    const posts = filteredFiles.slice(startIndex, endIndex).map((file) => {
        const filePath = `${postsDir}/${file}`;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const firstLine = lines[0].trim();
        let time = null;

        if (firstLine.startsWith('[time:') && firstLine.endsWith(';]')) {
            const timeMatch = /\[time:(.*?);sum:(.*?);]/.exec(firstLine);
            if (timeMatch) {
                const timeValue = timeMatch[1];
                const sumValue = timeMatch[2];
                time = {
                    value: timeValue,
                    sum: '<p>' + sumValue + '<p/>'
                };
            }
        }

        const content = lines.slice(1).join('\n');
        const htmlContent = marked.parse(content);

        return {
            title: file.replace('.md', ''),
            content: htmlContent,
            time: time
        };
    });

    // 对文章数据进行排序
    posts.sort((a, b) => {
        if (a.time && b.time) {
            return b.time.value - a.time.value;
        } else {
            return 0;
        }
    });

    // 检查时间数据是否为空，如果为空则设置默认值
    posts.forEach((post) => {
        if (!post.time) {
            post.time = {
                value: '',
                sum: ''
            };
        }
    });

    const totalPages = Math.ceil(filteredFiles.length / POSTS_PER_PAGE);

    return { posts, totalPages };
}

app.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const { posts, totalPages } = generatePostsData(page);

    res.render('index', { posts, currentPage: page, totalPages });
});

app.get('/archives', (req, res) => {
    const { posts } = generatePostsData(1);

    res.render('archives', { posts });
});

app.get('/post/:title', (req, res) => {
    const { title } = req.params;
    const filePath = `./posts/${title}.md`;

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const firstLine = lines[0].trim();
        let time = null;

        if (firstLine.startsWith('[time:') && firstLine.endsWith(';]')) {
            const timeMatch = /\[time:(.*?);sum:(.*?);]/.exec(firstLine);
            if (timeMatch) {
                const timeValue = timeMatch[1];
                const sumValue = timeMatch[2];
                time = {
                    value: timeValue,
                    sum: sumValue
                };
            }
        }

        const content = lines.slice(1).join('\n');
        const htmlContent = marked.parse(content);

        res.render('post', { title, content: htmlContent, time });
    } else {
        res.status(404).send('Post not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function getPostTitles() {
    const postsDir = './posts';
    const postFiles = fs.readdirSync(postsDir);

    return postFiles.map((file) => file.replace('.md', ''));
}

function getPostData(title) {
    const filePath = `./posts/${title}.md`;

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const firstLine = lines[0].trim();
        let time = null;

        if (firstLine.startsWith('[time:') && firstLine.endsWith(';]')) {
            const timeMatch = /\[time:(.*?);sum:(.*?);]/.exec(firstLine);
            if (timeMatch) {
                const timeValue = timeMatch[1];
                const sumValue = timeMatch[2];
                time = {
                    value: timeValue,
                    sum: sumValue
                };
            }
        }

        const content = lines.slice(1).join('\n');
        const htmlContent = marked.parse(content);

        return {
            title,
            content: htmlContent,
            time
        };
    } else {
        return null;
    }
}

module.exports = {
    generatePostsData: generatePostsData,
    getPostTitles: getPostTitles,
    getPostData: getPostData
};
