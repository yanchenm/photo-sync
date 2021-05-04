"""create users table

Revision ID: 6ff62e83bde3
Revises: 
Create Date: 2021-05-03 04:24:11.303356

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '6ff62e83bde3'
down_revision = None
branch_labels = None
depends_on = None


def upgrade(engine_name):
    globals()["upgrade_%s" % engine_name]()


def downgrade(engine_name):
    globals()["downgrade_%s" % engine_name]()


def upgrade_dev():
    op.create_table(
        "Users",
        sa.Column("email", sa.Text, primary_key=True),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("password", sa.String(60), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.current_timestamp(), nullable=False)
    )


def downgrade_dev():
    op.drop_table("Users")


def upgrade_prod():
    op.create_table(
        "Users",
        sa.Column("email", sa.Text, primary_key=True),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("password", sa.String(60), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.current_timestamp(), nullable=False)
    )


def downgrade_prod():
    op.drop_table("Users")
