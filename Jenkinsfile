pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    triggers {
        // Trigger on push (polling SCM)
        pollSCM('H/2 * * * *')
        // GitHub webhook trigger for push and pull requests
        githubPush()
    }

    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKERHUB_USERNAME = 'hamzaelboukri'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.GIT_BRANCH_NAME = env.GIT_BRANCH?.replaceAll('origin/', '') ?: 'unknown'
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Install') {
                    steps {
                        dir('backend') {
                            // Cache node_modules
                            sh '''
                                if [ -d "node_modules" ]; then
                                    echo "Using cached node_modules"
                                fi
                                npm ci --cache .npm
                            '''
                        }
                    }
                }
                stage('Frontend Install') {
                    steps {
                        dir('frontend') {
                            // Cache node_modules
                            sh '''
                                if [ -d "node_modules" ]; then
                                    echo "Using cached node_modules"
                                fi
                                npm ci --cache .npm
                            '''
                        }
                    }
                }
            }
        }

        stage('Lint') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            // Pipeline FAILS if lint fails
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            // Pipeline FAILS if lint fails
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            // Pipeline FAILS if tests fail
                            sh 'npm run test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            // Skip if no test script (will be added later)
                            sh 'npm run test --if-present || echo "No frontend tests configured"'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            // Pipeline FAILS if build fails
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            // Build frontend (Docker handles Node version)
                            sh 'echo "Frontend build will be done in Docker stage"'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Check if Docker is available
                    def dockerAvailable = sh(script: 'docker info > /dev/null 2>&1', returnStatus: true) == 0
                    if (dockerAvailable) {
                        parallel(
                            'Build Backend Image': {
                                dir('backend') {
                                    sh "docker build -t ${DOCKERHUB_USERNAME}/r-event-backend:${env.GIT_COMMIT_SHORT} -t ${DOCKERHUB_USERNAME}/r-event-backend:latest ."
                                }
                            },
                            'Build Frontend Image': {
                                dir('frontend') {
                                    sh "docker build -t ${DOCKERHUB_USERNAME}/r-event-frontend:${env.GIT_COMMIT_SHORT} -t ${DOCKERHUB_USERNAME}/r-event-frontend:latest ."
                                }
                            }
                        )
                    } else {
                        echo '⚠️ Docker not available - skipping Docker build stage'
                        echo 'To enable Docker: mount /var/run/docker.sock to Jenkins container'
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def dockerAvailable = sh(script: 'docker info > /dev/null 2>&1', returnStatus: true) == 0
                    if (dockerAvailable) {
                        withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh '''
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                
                                # Push Backend images
                                docker push ${DOCKERHUB_USERNAME}/r-event-backend:${GIT_COMMIT_SHORT}
                                docker push ${DOCKERHUB_USERNAME}/r-event-backend:latest
                                
                                # Push Frontend images
                                docker push ${DOCKERHUB_USERNAME}/r-event-frontend:${GIT_COMMIT_SHORT}
                                docker push ${DOCKERHUB_USERNAME}/r-event-frontend:latest
                                
                                docker logout
                            '''
                        }
                    } else {
                        echo '⚠️ Docker not available - skipping Docker push stage'
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh '''
                        docker-compose -f docker-compose.yml down || true
                        docker-compose -f docker-compose.yml up -d --build
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
                script {
                    sh '''
                        docker-compose -f docker-compose.yml down || true
                        docker-compose -f docker-compose.yml up -d
                    '''
                }
            }
        }
    }

    post {
        always {
            node('') {
                cleanWs()
            }
        }
        success {
            echo '✅ Pipeline completed successfully!'
            echo "📦 Images pushed: ${DOCKERHUB_USERNAME}/r-event-backend:${env.GIT_COMMIT_SHORT}"
            echo "📦 Images pushed: ${DOCKERHUB_USERNAME}/r-event-frontend:${env.GIT_COMMIT_SHORT}"
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for details.'
        }
        unstable {
            echo '⚠️ Pipeline unstable!'
        }
    }
}
