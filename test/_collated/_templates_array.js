var _templates = {
  'sub/path/test2.handlebars': ['<div id="test">{{ title }}</div>'].join('\n'),
  'sub/path/test2.html': ['<div id="test"></div>'].join('\n'),
  'test1': ['<div id='test'>{{ title }}</div>'].join('\n'),
  'test2': ['<div id="test2">','    <p><strong>Top</strong></p>','</div>'].join('\n'),
  'test3': ['<div id="test3">','    ','    ','    ','    <p><strong>Top</strong></p>','    ','    ','        <p>Another Paragraph</p>','</div>'].join('\n'),
  'test4': ['{{#each group}}','<div class="lbs-poigroup">','    <h3>{{ title }}</h3>','    ','    <ul class="lbs-results">','    {{#each items}}','        <li>{{ content }}</li>','    {{/each}}','</div>','{{/each}}'].join('\n')
};
