/**
 * Copyright 2020 Solenix Schweiz GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


module.exports = function (ctx) {
    var fs = require('fs'),
        path = require('path'),
        deferral = require('q').defer(),
        async = require('async');

    var files = {
        'build-extras.gradle': 'platforms/android/build-extras.gradle'
    };

    var copyFiles = function() {
        Object.keys(files).forEach(function (srcFile) {
            var src = path.join(ctx.opts.projectRoot, srcFile);
            var dest = path.join(ctx.opts.projectRoot, files[srcFile]);

            if (fs.existsSync(src) && fs.existsSync(path.dirname(dest))) {
                console.log('copying ' + src + ' to ' + dest);
                fs.createReadStream(src).pipe(fs.createWriteStream(dest));
            }
        });
    };

    copyFiles();
};
