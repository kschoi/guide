#! /bin/bash
# .sh 파일을 이용한 grunt 전자동 템플릿

args=("$@")


# 저장소 복제
git clone https://github.com/demun/template.git ${args[0]}


# 프로젝트 폴더로 이동
cd ${args[0]}


# 필요없는 폴더및 파일 삭제
rm -rf .git
rm -rf README.md


# npm install
npm install

# bower install
bower install

# grunt serve
grunt serve

