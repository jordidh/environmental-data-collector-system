### Logging
Es fa servir Morgan per deixar logs de les crides http i Winston per formatar
els logs.
Morgan deixa logs a través de Winston.

Els logs són objectes JSON.
Els logs deixats des de l'aplicació tenen el segënt format:
{
    "message":"Listening on port 3000",
    "level":"info"
}

Els logs deixats per Morgan tenen el següent format:
{
    "message":"HTTP Access Log"
    "remoteAddr":"::1",
    "remoteUser":"-",
    "date":"[29/Jan/2021:18:15:18 +0000]",
    "method":"GET",
    "url":"/",
    "status":304,
    "contentLength":"-",
    "referrer":"-",
    "userAgent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
    "responseTime":320.718,
    "level":"info",
}

Per diferenciar-los ens hem de fixar amb el camp "message", si el valor és
"HTTP Access Log" és que el log l'ha deixat morgan, sinó l'haurà deixar 
l'aplicació.
També ens podem fixar amb el número d'atributs de l'objecte, si en té 2 l'ha 
deixat l'aplicació, sinó l'ha deixat morgan.


### Node Express template project

This project is based on a GitLab [Project Template](https://docs.gitlab.com/ee/gitlab-basics/create-project.html).

Improvements can be proposed in the [original project](https://gitlab.com/gitlab-org/project-templates/express).

### CI/CD with Auto DevOps

This template is compatible with [Auto DevOps](https://docs.gitlab.com/ee/topics/autodevops/).

If Auto DevOps is not already enabled for this project, you can [turn it on](https://docs.gitlab.com/ee/topics/autodevops/#enabling-auto-devops) in the project settings.

### Developing with Gitpod

This template has a fully-automated dev setup for [Gitpod](https://docs.gitlab.com/ee/integration/gitpod.html).

If you open this project in Gitpod, you'll get all Node dependencies pre-installed and Express will open a web preview.

### Detecció d'equips connectats a la xarxa
Mostrar el sistema operatiu i els ports oberts
```
nmap -O 192.168.1.0/24
```
