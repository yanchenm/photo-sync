"""create tokens table

Revision ID: faf138220ec9
Revises: 75fbb6e3779a
Create Date: 2021-05-03 05:11:00.382091

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'faf138220ec9'
down_revision = '75fbb6e3779a'
branch_labels = None
depends_on = None


def upgrade(engine_name):
    globals()["upgrade_%s" % engine_name]()


def downgrade(engine_name):
    globals()["downgrade_%s" % engine_name]()


def upgrade_dev():
    op.create_table(
        "Tokens",
        sa.Column("email", sa.Text, sa.ForeignKey("Users.email", ondelete="CASCADE"), primary_key=True),
        sa.Column("token", sa.Text, unique=True, primary_key=True)
    )


def downgrade_dev():
    op.drop_table("Tokens")


def upgrade_prod():
    op.create_table(
        "Tokens",
        sa.Column("email", sa.Text, sa.ForeignKey("Users.email", ondelete="CASCADE"), primary_key=True),
        sa.Column("token", sa.Text, unique=True, primary_key=True)
    )


def downgrade_prod():
    op.drop_table("Tokens")
