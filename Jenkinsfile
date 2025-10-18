pipeline {
    agent any

    environment {
        REGISTRY = "docker.io/${DOCKER_USERNAME}"
        IMAGE_NAME = "server-lms-net"
        SERVER_HOST = "103.20.96.174"
        SERVER_USER = "root"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                  branches: [[name: '*/main']],
                  userRemoteConfigs: [[
                    url: 'https://github.com/phuocdai2004/psychic-octo-fortnight.git',
                    credentialsId: 'github-pat'
                  ]]
                ])
            }
        }

        // stage('Build & Test') {
        //     steps {
        //         sh 'dotnet restore LearnKing.sln'
        //         sh 'dotnet build LearnKing.sln -c Release'
        //         //sh 'dotnet test LearnKing.sln'
        //     }
        // }

        stage('Docker Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    
                    // Login trước khi build để pull base image
                    bat """
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker build -t docker.io/%DOCKER_USER%/${IMAGE_NAME}:latest .
                    """
                }
            }
        }
        stage('Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    
                    // Login Docker Hub bằng --password-stdin (an toàn)
                    bat """
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push docker.io/%DOCKER_USER%/${IMAGE_NAME}:latest
                    """
                }
            }
        }



        // stage('Deploy Server') {
        //     steps {
        //         echo 'Deployment skipped - Using Render auto-deploy'
        //         echo 'Docker image is available at: docker.io/phuocdai2004/server-lms-net:latest'
        //     }
        // }
    }
}
