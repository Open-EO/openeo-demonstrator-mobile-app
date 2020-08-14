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
    var fs = require('fs');
    var path = require('path');

    if (!ctx.opts.platforms.includes('android')) {
        return;
    }

    var files = {
        'platforms/android/app/build/outputs/apk/debug/app-debug.apk': 'output/app-debug.apk',
        'platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk': 'output/app-release-unsigned.apk',
        'platforms/android/app/build/outputs/mapping/release/mapping.txt': 'output/mapping.txt'
    }

    Object.keys(files).forEach(function (srcFile) {
        var src = path.join(ctx.opts.projectRoot, srcFile);
        var dest = path.join(ctx.opts.projectRoot, files[srcFile]);
        var destDir = path.dirname(dest);

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
        }

        if (fs.existsSync(src) && fs.existsSync(destDir)) {
            console.log('copying ' + src + ' to ' + dest);
            fs.createReadStream(src).pipe(fs.createWriteStream(dest));
        }
    });
};
