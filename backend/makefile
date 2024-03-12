file?=

run:
	@uvicorn core.main:app --reload

ifeq ($(PROD), True)
makemigrations :
	@alembic revision --autogenerate -m "$(msg)" --version-path alembic/versions/prod
else 
makemigrations :
	@alembic revision --autogenerate -m "$(msg)" --version-path alembic/versions/local
endif

migrateUP:
	@alembic upgrade head $(file)

migrateDOWN:
	@alembic downgrade base $(file)

install:
	@pipenv install

shell:
	@pipenv shell

celery:
	@celery -A core.celery worker -l info -E

deploy:
	@uvicorn core.main:app --reload & celery -A core.celery worker -l info -E

help:
	@echo "make run :- to run the server"
	@echo "make makemigrations msg='message' :- create a migration file with message"
	@echo "make migrateUP file='file' :- migrate up to the file"
	@echo "make migrateDOWN file='file' :- migrate down to the file"
	@echo "make shell :- to run the shell"
	@echo "make install :- to install all dependencies"
	@echo "make celery :- to run the celery"
	@echo "make help :- to see this all commands"