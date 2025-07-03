from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in custom_order_workflow/__init__.py
from custom_order_workflow import __version__ as version

setup(
	name="custom_order_workflow",
	version=version,
	description="Custom Order Workflow for Office Furniture Manufacturing",
	author="Manus AI",
	author_email="support@manus.ai",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)

